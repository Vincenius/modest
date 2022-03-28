import React, { useState } from 'react'
import { useS3Upload } from "next-s3-upload"
import Skeleton from '@mui/material/Skeleton'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'

import styles from './FileUpload.module.css'

const resizeFile = ({ file, width = 500, height = 500 }) =>
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

export default function UploadFiles({ urls = [], setUrls }) {
  const { uploadToS3 } = useS3Upload()
  const [isLoading, setIsLoading] = useState(false)

  const handleFilesChange = async ({ target }) => {
    setIsLoading(true)
    const files = Array.from(target.files);

    // TODO map & promise all
    for (let index = 0; index < files.length; index++) {
      const file = files[index] || {};
      if (file.type.startsWith('video')) {
        const { url } = await uploadToS3(file)
        console.log(url)
        setUrls(current => [...current, { url, type: 'video' }]);
      } else {
        const thumbnailFile = await resizeFile({ file })
        const mediumFile = await resizeFile({ file, width: 1600, height: 1600 })

        const [{ url }, { url: thumbnailUrl }, { url: mediumUrl }] = await Promise.all([
          uploadToS3(file),
          uploadToS3(thumbnailFile),
          uploadToS3(mediumFile),
        ])

        setUrls(current => [...current, { url, thumbnailUrl, mediumUrl, type: 'image' }]);
      }
    }

    setIsLoading(false)
  };

  return (
    <div>
      <input
        type="file"
        name="file"
        multiple={true}
        onChange={handleFilesChange}
      />

      <div className={styles.previewContainer}>
        {urls.map((url, index) => (
          <div key={url.url}>
            { url.type !== 'video' && <img src={url.mediumUrl} />}
            { url.type === 'video' && <video><source src={url.url} /></video> }
            <DeleteForeverIcon onClick={() => setUrls(current => current.filter(c => c.url !== url.url))}/>
          </div>
        ))}

        { isLoading && <Skeleton variant="rectangular" height={200} width={200} /> }
      </div>
    </div>
  );
}