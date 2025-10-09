//
// This is the client configuration tree.
// Guide: https://manual.os-js.org/config/#client
// Complete config tree: https://github.com/os-js/osjs-client/blob/master/src/config.js
//

export default {
  // Removed auto-login - users must login manually
  // auth: {
  //   login: {
  //     username: "demo",
  //     password: "demo",
  //   },
  // },
  desktop: {
    settings: {
      background: {
        src: "/wall.png", // Set to image URL like '/my-wallpaper.jpg' for custom wallpaper
        color: "#0e1a2b", // Dark blue background (change this for solid color)
        style: "cover", // 'cover', 'contain', 'repeat', 'center'
      },
      font: "Roboto",
      theme: "StandardTheme",
      icons: "GnomeIcons",
      sounds: "FreedesktopSounds",
    },
  },
};
