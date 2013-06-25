EpubFetch.PlainExplodedFetcher = EpubFetchBase.extend({

    initialize: function (attributes) {
    },

    // Plain exploded EPUB packages are exploded by definition:
    isExploded: function () {
        return true;
    },

    resolveURI: function (epubResourceURI) {
        // Make absolute to the package document path
        var epubResourceRelURI = new URI(epubResourceURI);
        var epubResourceAbsURI = epubResourceRelURI.absoluteTo(this.get('baseUrl'));
        return epubResourceAbsURI.toString();
    },

    fetchFileContentsText: function (fileUrl, fetchCallback, onerror) {
        var thisFetcher = this;
        $.ajax({
            url: fileUrl,
            dataType: 'text',
            success: function (result) {
                fetchCallback(result);
            },
            error: function (xhr, status, errorThrown) {
                console.log('Error when AJAX fetching ' + fullUrl);
                console.log(status);
                console.log(errorThrown);
                onerror(errorThrown);
            }
        });
    },

    getPackageDom: function (callback) {
        var thisFetcher = this;
        thisFetcher.fetchFileContentsText(
            thisFetcher.get('baseUrl'),
            function (packageXml) {
                var packageDom = thisFetcher.parseXml(packageXml);
                callback(packageDom);
            },
            this._handleError
        );
    }
});