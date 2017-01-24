import React from 'react';

export const  MediaPreview = ({src, type}) => {
  if (!src) {
    return null
  }
  try {
    switch(type) {
      case "video/quicktime":
        return (
          <div>
            <video controls="controls" src={src} style={{maxWidth: "50%"}} />
          </div>
        )
      default:
      const u= src.split('?')[0]
      switch(u.split('.').pop().toLowerCase()) {
        case "mov":
          return (
            <div>
              <video controls="controls" src={src} style={{maxWidth: "50%"}} />
            </div>
          )
        case "png":
        case "jpg":
        case "jpeg":
        case "gif":
          return (
            <div>
              <img src={src} style={{maxWidth: "50%"}} />
            </div>
          )
        default:
          if (src.startsWith("data:video")) {
            return (
              <div>
                <video controls="controls" src={src} style={{maxWidth: "50%"}} />
              </div>
            )
          } else {
            return (
              <div>
                <img src={src} style={{maxWidth: "50%"}} />
              </div>
            )

          }
      }
    }

  } catch(x) {
    console.log('error in media preview ', x )
    return (
      <div>{x}</div>
    )
  }

}
