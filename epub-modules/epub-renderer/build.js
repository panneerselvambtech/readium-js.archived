requirejs({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        jquerySizes: {
            deps: ['jquery']
        },
        readiumSDK: "readiumSDK",
        helpers: "helpers",
        triggers: "triggers",
		smilModel: "smilModel",
        smilIterator: "smilIterator",
        mediaOverlay: "mediaOverlay",
        bookmarkData: "bookmarkData",
        spineItem: "spineItem",
        spine: "spine",
        fixedPageSpread: "fixedPageSpread",
        package: "package",
        viewerSettings: "viewerSettings",
        currentPagesInfo: "currentPagesInfo",
        pageOpenRequest: "openPageRequest",
        epubCfi: "epubCfi",
        cfiNavigationLogic: "cfiNavigationLogic",
        reflowableView: "reflowableView",
        onePageView: "onePageView",
        fixedView: "fixedView",
		styleCollection: "styleCollection",
        readerView: "readerView",
        mediaOverlayElementHighlighter: "mediaOverlayElementHighlighter",
        audioPlayer: "audioPlayer",
        mediaOverlayPlayer: "mediaOverlayPlayer"
    },
    paths: {
        jquery: '../../lib/jquery-1.9.1',
        jquerySizes: '../../lib/jquery.sizes',
        underscore: '../../lib/underscore-1.4.4',
        backbone: '../../lib/backbone-0.9.10',
        URIjs: '../../lib/URIjs',
        epubCfi: 'readium-shared-js/lib/epub_cfi',
        readiumSDK: 'readium-shared-js/js/readium_sdk',
        helpers: 'readium-shared-js/js/helpers',
        triggers: 'readium-shared-js/js/models/trigger',
        smilModel: 'readium-shared-js/js/models/smil_model',
        smilIterator: 'readium-shared-js/js/models/smil_iterator',
        mediaOverlay: 'readium-shared-js/js/models/media_overlay',
        bookmarkData: 'readium-shared-js/js/models/bookmark_data',
        spineItem: 'readium-shared-js/js/models/spine_item',
        spine: 'readium-shared-js/js/models/spine',
        fixedPageSpread: 'readium-shared-js/js/models/fixed_page_spread',
        package: 'readium-shared-js/js/models/package',
        viewerSettings: 'readium-shared-js/js/models/viewer_settings',
        currentPagesInfo: 'readium-shared-js/js/models/current_pages_info',
        pageOpenRequest: 'readium-shared-js/js/models/page_open_request',
        cfiNavigationLogic: 'readium-shared-js/js/views/cfi_navigation_logic',
        reflowableView: 'readium-shared-js/js/views/reflowable_view',
        onePageView: 'readium-shared-js/js/views/one_page_view',
        fixedView: 'readium-shared-js/js/views/fixed_view',
        styleCollection: 'readium-shared-js/js/models/style_collection',
        readerView: 'readium-shared-js/js/views/reader_view',
        mediaOverlayElementHighlighter: 'readium-shared-js/js/views/media_overlay_element_highlighter',
        audioPlayer: 'readium-shared-js/js/views/audio_player',
        mediaOverlayPlayer: 'readium-shared-js/js/views/media_overlay_player'
    },
    exclude: ['jquery', 'jquerySizes', 'underscore', 'backbone', 'URIjs/URI'],
    wrap : {
        startFile : "start.frag",
        endFile : "end.frag"
    }
})
