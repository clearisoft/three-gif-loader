import { CanvasTexture } from 'three/src/textures/CanvasTexture';

export default class GifTexture extends CanvasTexture {
  constructor(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy) {
    super(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);

    this.needsUpdate = false;
    this.updateTimerId = 0;
  }

  setReader(reader) {
    this.reader = reader;

    this.image = document.createElement('canvas');
    this.image.width = reader.width;
    this.image.height = reader.height;
    this.context = this.image.getContext('2d');

    this.frameNumber = 0;
    this.previousFrameInfo = null;
  }

  draw() {
    if (!this.reader) {
      return;
    }

    const { reader, image, context } = this;
    const { width, height } = image;

    const frameNum = ++this.frameNumber % reader.numFrames();
    const frameInfo = reader.frameInfo(frameNum);

    if (frameNum === 0) {
      // always clear canvas to start
      context.clearRect(0, 0, width, height);
    } else if (this.previousFrameInfo && this.previousFrameInfo.disposal === 2) {
      // disposal was "restore to background" which is essentially "restore to transparent"
      context.clearRect(this.previousFrameInfo.x,
                        this.previousFrameInfo.y,
                        this.previousFrameInfo.width,
                        this.previousFrameInfo.height);
    }

    const imageData = context.getImageData(0, 0, width, height);
    reader.decodeAndBlitFrameRGBA(frameNum, imageData.data);
    context.putImageData(imageData, 0, 0);

    this.needsUpdate = true;

    this.previousFrameInfo = frameInfo;
    this.updateTimerId = setTimeout(this.draw.bind(this), frameInfo.delay * 10);
  }

  play() {
    clearTimeout(this.updateTimerId)
    this.draw();
  }

  pause() {
    clearTimeout(this.updateTimerId)
  }
};
