from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib, threading, os
from typing import Dict, List


class EmailAttachment:
	filename: str
	content: bytes

	@staticmethod
	def fromPath(path, filename=None):
		attachment = EmailAttachment()
		attachment.filename = os.path.basename(path)
		if not filename is None: attachment.filename = filename
		with open(path, 'rb') as f:
			attachment.content = f.read()
		return attachment

	@staticmethod
	def fromBytes(filename, content):
		attachment = EmailAttachment()
		attachment.filename = filename
		attachment.content = content
		return attachment


class EmailSender:
	email: str
	password: str

	def __init__(self, config: Dict) -> None:
		self.email = config['email']
		self.password = config['password']

	def send(
		self,
		receiver: str,
		subject: str = None,
		text: str = None,
		html: str = None,
		attachments: List[EmailAttachment] = []
	):
		s = smtplib.SMTP('smtp.gmail.com', 587)
		if subject is None: subject = 'No Subject'
		message = MIMEMultipart()
		message["From"] = self.email
		message["To"] = receiver
		message["Subject"] = subject
		message["Bcc"] = receiver
		if not text is None: message.attach(MIMEText(text, "plain"))
		if not html is None: message.attach(MIMEText(html, "html"))
		for attachment in attachments:
			part = MIMEBase("application", "octet-stream")
			part.set_payload(attachment.content)
			encoders.encode_base64(part)
			part.add_header(
				"Content-Disposition",
				f"attachment; filename= {attachment.filename}"
			)
			message.attach(part)
		s.starttls()
		s.login(self.email, self.password)
		s.sendmail(self.email, receiver, message.as_string())
		s.quit()

	def sendMultiple(
		self,
		receivers: List[str],
		subject: str = None,
		text: str = None,
		html: str = None,
		attachments: List[EmailAttachment] = []
	):
		for receiver in receivers:
			self.send(receiver, subject, text, html, attachments)

	def sendInBackground(
		self,
		receiver: str,
		subject: str = None,
		text: str = None,
		html: str = None,
		attachments: List[EmailAttachment] = []
	):
		job = threading.Thread(
			target=self.send,
			args=(receiver,
					subject,
					text,
					html,
					attachments,
					)
		)
		job.start()

	def sendMultipleInBackground(
		self,
		receivers: List[str],
		subject: str = None,
		text: str = None,
		html: str = None,
		attachments: List[EmailAttachment] = []
	):
		for receiver in receivers:
			self.sendInBackground(receiver, subject, text, html, attachments)
