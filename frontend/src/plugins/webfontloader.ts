/**
 * plugins/webfontloader.ts
 *
 * webfontloader documentation: https://github.com/typekit/webfontloader
 */

export async function loadFonts () {
  const webFontLoader = await import(/* webpackChunkName: "webfontloader" */'webfontloader')

  webFontLoader.load({
    google: {
      families: [
        'Inter:wght@400;500;600;700&display=swap',
        'Plus+Jakarta+Sans:wght@600;700;800&display=swap',
      ],
    },
  })
}
