EpubFetch.PackageReader = EpubFetchBase.extend({

    initialize: function (attributes) {
        var contentTypeDiscovery = new EpubFetch.ContentTypeDiscovery({'contentUrl': this.get('packageDocumentURL')});
        this.set('_contentTypeDiscovery', contentTypeDiscovery);
        this._setupPackageContentType();
        this._setupResourceFetcher();
    },

    _setupPackageContentType: function () {
        this.set('_packageContentType', this.get('_contentTypeDiscovery').identifyContentType());
    },

    _getPackageReadStrategy: function () {
        var readStrategy = 'exploded';
        var packageContentType = this.getPackageContentType();
        if (packageContentType in this.constructor.contentTypePackageReadStrategyMap) {
            readStrategy = this.constructor.contentTypePackageReadStrategyMap[packageContentType]
        }
        return readStrategy;
    },

    _setupResourceFetcher: function () {
        var thisReader = this;
        var packageReadStrategy = thisReader._getPackageReadStrategy();
        if (packageReadStrategy === 'exploded') {
            console.log('using new EpubFetch.PlainExplodedFetcher');
            thisReader.set('_resourceFetcher', new EpubFetch.PlainExplodedFetcher({
                'baseUrl': thisReader.get('packageDocumentURL'),
                '_contentTypeDiscovery': thisReader.get('_contentTypeDiscovery')
            }));
        } else if (packageReadStrategy === 'zipped') {
            console.log('using new EpubFetch.ZipFetcher');
            thisReader.set('_resourceFetcher', new EpubFetch.ZipFetcher({
                'baseUrl': thisReader.get('packageDocumentURL'),
                '_contentTypeDiscovery': thisReader.get('_contentTypeDiscovery'),
                'libDir': thisReader.get('libDir')
            }));
        } else {
            throw new Error('Unsupported package read strategy: ' + packageReadStrategy);
        }
        thisReader.set('_resourceResolver', new EpubFetch.ResourceResolver({
            '_resourceFetcher': thisReader.get('_resourceFetcher')
        }));
    },

    isPackageExploded: function () {
          return this.get('_resourceFetcher').isExploded();
    },

    resolveURI: function (epubResourceURI) {
        return this.get('_resourceFetcher').resolveURI(epubResourceURI);
    },

    relativeToPackageFetchFileContents: function (relativePath, fetchMode, fetchCallback, onerror) {
        this.get('_resourceFetcher').relativeToPackageFetchFileContents(relativePath, fetchMode, fetchCallback, onerror);
    },

    getPackageContentType: function () {
        return this.get('_packageContentType');
    },

    getPackageDom: function (callback) {
        this.get('_resourceFetcher').getPackageDom(callback);
    },

    resolveInternalPackageResources: function (contentDocumentURI, contentDocumentType, contentDocumentText,
                                               resolvedDocumentCallback) {
        this.get('_resourceResolver').resolveInternalPackageResources(contentDocumentURI, contentDocumentType,
            contentDocumentText, resolvedDocumentCallback);
    }

}, {
    contentTypePackageReadStrategyMap: {
        'application/oebps-package+xml': 'exploded',
        'application/epub+zip': 'zipped',
        'application/zip': 'zipped'
    }
});