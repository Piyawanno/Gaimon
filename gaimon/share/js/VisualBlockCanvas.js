const VisualBlockCanvas = function() {
	const object = this;

	this.creator;
	this.canvas;
	this.context;
	this.contentX;
	this.contentY;

	this.arrow = {};

	this.create = async function(form) {
		object.creator = form;
		const content = form.dom.visualblock_content;
		const contentRect = content.getBoundingClientRect();
		object.contentX = contentRect.x;
		object.contentY = contentRect.y;
		object.canvas = new DOMObject(await TEMPLATE.get('VisualBlockCanvas', false));
		object.canvas.html.width = contentRect.width;
		object.canvas.html.height = contentRect.height;
		object.canvas.onresize = object.update;
		content.append(object.canvas);
		object.context = object.canvas.html.getContext('2d');

		await main.appendResizeEvent('visualblock', object.update);
		await main.onresize()
	};

	this.draw = async function(source, destination) {
		const src = source.getAttribute('rel').replace('visualblock_tool_', '');
		const des = destination.getAttribute('rel').replace('visualblock_tool_', '');
		if(object.arrow[des] == undefined) object.arrow[des] = {};
		for(let i in object.arrow) {
			if(src in object.arrow[i]) {
				delete object.arrow[i][src];
				break;
			}
		}
		object.arrow[des][src] = {src:source, des:destination};
		object.update();
	};

	this.remove = async function(source) {
		const src = source.getAttribute('rel').replace('visualblock_tool_', '');
		for(let i in object.arrow) {
			if(src in object.arrow[i]) {
				delete object.arrow[i][src];
			}
			if(Object.values(object.arrow[i]) == 0) {
				delete object.arrow[i];
			}
		}
		object.update();
	};

	this.update = async function() {
		const contentRect = object.creator.dom.visualblock_content.getBoundingClientRect();
		object.canvas.html.width = contentRect.width;
		object.canvas.html.height = contentRect.height;
		object.contentX = contentRect.x;
		object.contentY = contentRect.y;
		object.context.clearRect(0, 0, contentRect.width, contentRect.height);
		for(let i in object.arrow) {
			const length = Object.keys(object.arrow[i]).length;
			const half = length%2 == 0 ? length/2 : Math.ceil(length/2);
			let count = length;
			for(let j in object.arrow[i]) {
				const offset = 1 - half;
				// const offset = count - half;
				const item = object.arrow[i][j];
				const srcRect = item.src.getBoundingClientRect();
				const desRect = item.des.getBoundingClientRect();
				object.drawCircle(srcRect);
				object.drawArrow(desRect, offset);
				object.drawLine(srcRect, desRect, offset);
				count -= 1;
			}
		}
	};

	this.drawCircle = async function(rect) {
		const x = rect.right - object.contentX;
		const y = rect.top + rect.height/2 - object.contentY;
		object.context.beginPath();
		object.context.arc(x, y, 5, 0, 2*Math.PI, false);
		object.context.closePath();
		object.context.fillStyle = 'black';
		object.context.fill();
	};

	this.drawArrow = async function(rect, offset) {
		const x = rect.left - object.contentX;
		const y = rect.top + rect.height/2 - object.contentY;
		const d = 15*offset;
		object.context.beginPath();
		object.context.moveTo(x, y + d);
		object.context.lineTo(x - 12, y + 5 + d);
		object.context.lineTo(x - 12, y - 5 + d);
		object.context.closePath();
		object.context.fillStyle = 'black';
		object.context.fill();
	};

	this.drawLine = async function(srcRect, desRect, offset) {
		const startX = srcRect.right - object.contentX;
		const startY = srcRect.top + srcRect.height/2 - object.contentY;
		const halfX = srcRect.right + (desRect.left - srcRect.right)/2 - object.contentX;
		const endX = desRect.left - object.contentX;
		const endY = desRect.top + desRect.height/2 - object.contentY;
		const d = 15*offset;
		object.context.beginPath();
		object.context.moveTo(startX, startY);
		object.context.lineTo(halfX, startY);
		object.context.lineTo(halfX, endY + d);
		object.context.lineTo(endX, endY + d);
		object.context.lineWidth = 2;
		object.context.strokeStyle = 'black';
		object.context.stroke();
	};
};