from PIL import Image

async def createThumbnailImage(path, width=400, height=300):
	thumbnailPath = getThumbnailPath(path)
	image = Image.open(path)
	image.thumbnail((width, height))
	image.save(thumbnailPath)

def getThumbnailPath(path):
	splitted = path.split('.')
	thumbnailPath = '.'.join(splitted[:-1])+'.thumbnail.'+splitted[-1]
	return thumbnailPath