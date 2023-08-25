from gaimon.util.CommonDBBounded import CommonDBBounded
from gaimon.model.PasswordRenew import PasswordRenew
from gaimon.model.User import User

from typing import List
from datetime import datetime, timedelta
from fpdf import FPDF

import qrcode, io, base64


class QRRegistrationGenerator(CommonDBBounded):
	def __init__(self, config):
		CommonDBBounded.__init__(self, config)
		self.config = config
		self.rootURL = config['rootURL']
		self.expireDay = config['expireDay']
		self.storePath = config['storePath']
		self.userIDList = config['userIDList']

	async def generate(self):
		await self.connectDB()
		clause = f"WHERE id IN ({','.join([str(uid) for uid in self.userIDList])})"
		userList = await self.session.select(User, clause=clause)
		registrationList = await self.generateRegistration(userList)
		self.generatePDF(registrationList)

	async def generateRegistration(self, userList: List[User]) -> List[PasswordRenew]:
		registrationList: List[PasswordRenew] = []
		expireDate = datetime.now() + timedelta(days=self.expireDay)
		for i, user in enumerate(userList):
			registration = PasswordRenew()
			registration.uid = user
			registration.expireDate = expireDate
			registration.generate()
			registration.id = i
			await self.session.insert(registration)
			registrationList.append(registration)
		return registrationList

	def generatePDF(self, registrationList: List[PasswordRenew]):
		document = FPDF(orientation='P', unit='mm', format='A4')
		for registration in registrationList:
			code = registration.encode()
			url = f'{self.rootURL}authentication/register/QR/{code}'
			qr = qrcode.QRCode(box_size=10)
			qr.add_data(url)
			image = qr.make_image()
			image.save('/tmp/QRRegistration.png')
			document.add_page()
			document.set_xy(0.0, 32.0)
			document.set_font('Arial', 'B', 56)
			document.set_text_color(0, 0, 0)
			document.cell(
				w=210.0,
				h=64.0,
				align='C',
				txt=registration.uid.username,
				border=0
			)
			document.set_xy(42.0, 72.0)
			document.add_page()
			document.set_xy(42.0, 72.0)
			document.image('/tmp/QRRegistration.png', w=128.0, h=128.0)
			print(f'User {registration.uid.username} is generated.')
		document.output(self.storePath)

	async def generateQRCode(self, uid, session):
		self.session = session
		userList = await self.session.select(
			User,
			"WHERE id=?",
			parameter=[int(uid)],
			limit=1
		)
		registrationList = await self.generateRegistration(userList)
		code = registrationList[0].encode()
		url = f'{self.rootURL}authentication/renewPassword/{code.decode()}'
		qr = qrcode.QRCode(box_size=10)
		qr.add_data(url)
		image = qr.make_image()
		imageBytes = io.BytesIO()
		image.save(imageBytes, format="PNG")
		content = imageBytes.getvalue()
		imageBytes.close()
		return base64.b64encode(content).decode()
