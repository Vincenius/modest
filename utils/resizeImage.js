export const getImageDimensions = file => new Promise(resolve => {
  const dataURL = window.URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    resolve({
      height: img.height,
      width: img.width
    })
  }
  img.src = dataURL
})

export const getResizedImage = ({ imageSize, file, imageMaxSize }) =>
  imageSize > 300
    ? resizeImage({ file, width: imageMaxSize, height: imageMaxSize })
    : Promise.resolve(file)

export const resizeImage = ({ file, width, height }) =>
  new Promise((resolve, reject) => {
    const fileType = file.type;
    const fileName = file.name;
    const reader = new FileReader();

    reader.onloadend = function() {
      var image = new Image();
          image.src = reader.result;

      image.onload = function() {
        var maxWidth = width,
            maxHeight = height,
            imageWidth = image.width,
            imageHeight = image.height;

        if (imageWidth > imageHeight) {
          if (imageWidth > maxWidth) {
            imageHeight *= maxWidth / imageWidth;
            imageWidth = maxWidth;
          }
        }
        else {
          if (imageHeight > maxHeight) {
            imageWidth *= maxHeight / imageHeight;
            imageHeight = maxHeight;
          }
        }

        var canvas = document.createElement('canvas');
        canvas.width = imageWidth;
        canvas.height = imageHeight;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

        canvas.toBlob((blob) => {
          // The resized file ready for upload
          let file = new File([blob], fileName, { type: fileType })
          resolve(file)
        }, fileType);
      }
    }

    reader.readAsDataURL(file);
  })

