const landingPage = url => {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Landing Page - Plex Webhooks Homebridge Plugin">
        <title>Landing Page - Plex Webhooks Homebridge Plugin</title>
        <style>
          html, body {
            width: 100%;
            height: 100%;
            background-color: rgb(31, 35, 38);
            color: rgb(255, 255, 255);
            font-family: "Open Sans Bold", "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 14px;
            font-weight: normal;
          }
          .container {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
            justify-content: center;
            flex-direction: column;
            text-align: center;
          }
          input {
            background-color: rgba(255, 255, 255, 0.08);
            color: rgb(238, 238, 238);
            border-radius: 4px;
            font-size: 14px;
            height: 40px;
            padding: 4px 1em;
            transition-delay: 0s, 0s;
            transition-duration: 0.2s, 0.2s;
            transition-property: background-color, color;
            transition-timing-function: ease, ease;
            width: 280px;
            -webkit-appearance: none;
            outline: none;
            border: none;
            box-sizing: border-box;
            text-align: center;
          }
          input:focus {
            background-color: rgb(238, 238, 238);
            color: rgb(85, 85, 85);
          }
          a, a:visited {
            color: #cc7b19;
            text-decoration: none;
            transition: color .2s;
          }
          a:hover, a:active {
            color: #fff;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <p>Add this URL on the<br /><a href="https://app.plex.tv/desktop#!/settings/webhooks" target="_blank">Webhooks page</a> of your PMS server:</p>
          <input class="input" type="text" value="${url}" size="64" onClick="this.select()" />
        </div>
      </body>
  </html>
  `;
};

module.exports = landingPage;
