const resizeImage = ({ file, width = 500, height = 500 }) =>
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

        // The resized file ready for upload
        // const base64File = canvas.toDataURL(fileType);
        // const finalFile = dataURItoBlob(base64File, file)
        canvas.toBlob((blob) => {
          let file = new File([blob], fileName, { type: fileType })
          resolve(file)
        }, fileType);
      }
    }

    reader.readAsDataURL(file);
  })

export default resizeImage
