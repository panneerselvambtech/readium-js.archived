EpubFixed.FixedPageViews = Backbone.Model.extend({

    defaults : function () {

        return {
            "fixedPages" : [],
            "currentPages" : [1],
        }
    },

    // -------------------------------------------- PUBLIC INTERFACE ---------------------------------

    initialize : function (attributes, options) {

        this.fixedPagination = new EpubFixed.PageNumberDisplayLogic({ spineObjects : this.get("spineObjects") });

        // Rationale: Get the page progression direction off the first spine object. This assumes that ppd is the 
        //   same for all FXL spine objects in the epub - which it should be. 
        this.set("pageProgressionDirection", this.get("spineObjects")[0].pageProgressionDirection);
    },

    renderFixedPages : function (bindingElement, viewerSettings, linkClickHandler, handlerContext) {
        var that = this;

        // Reset the default for a synthetic layout
        if (viewerSettings.syntheticLayout) {
            this.set("currentPages", [1, 2]);
        }

        this.loadPageViews(viewerSettings, function() {
            that.renderAll(bindingElement, linkClickHandler, handlerContext)
        });
    },

    nextPage : function (twoUp, pageSetEventContext) {

        var newPageNums;
        if (!this.onLastPage()) {

            newPageNums = this.fixedPagination.getNextPageNumbers(this.get("currentPages"), twoUp, this.get("pageProgressionDirection"));
            this.resetCurrentPages(newPageNums);

            // Trigger events
            pageSetEventContext.trigger("atNextPage");
            pageSetEventContext.trigger("displayedContentChanged");
            this.onLastPage() ? pageSetEventContext.trigger("atLastPage") : undefined;
        }
        else {
            pageSetEventContext.trigger("atLastPage");
        }
    },

    previousPage : function (twoUp, pageSetEventContext) {

        var newPageNums;
        if (!this.onFirstPage()) {

            newPageNums = this.fixedPagination.getPreviousPageNumbers(this.get("currentPages"), twoUp, this.get("pageProgressionDirection"));
            this.resetCurrentPages(newPageNums);
            
            // Trigger events
            pageSetEventContext.trigger("atPreviousPage");
            pageSetEventContext.trigger("displayedContentChanged");
            this.onFirstPage() ? pageSetEventContext.trigger("atFirstPage") : undefined;
        }
        else {
            pageSetEventContext.trigger("atFirstPage");
        }
    },

    onFirstPage : function () {

        if (this.get("currentPages")[0] <= 1) {
            return true;
        }

        return false;
    },

    onLastPage : function () {

        if (this.get("currentPages")[0]) {
            if (this.get("currentPages")[0] >= this.numberOfPages()) {
                return true;
            }
        }

        if (this.get("currentPages")[1]) {
            if (this.get("currentPages")[1] >= this.numberOfPages()) {
                return true;
            }
        }

        return false;
    },

    showPageNumber : function (pageNumber, syntheticLayout) {

        var pageIndexToShow;
        var fixedPageView;
        var pageNumsToShow = this.fixedPagination.getPageNumbers(pageNumber, syntheticLayout, this.get("pageProgressionDirection"));
        this.resetCurrentPages(pageNumsToShow);
    },

    setSyntheticLayout : function (isSynthetic) {

        var newPageNumbers;
        if (isSynthetic) {

            _.each(this.get("fixedPages"), function (fixedPageInfo) {
                fixedPageInfo.fixedPageView.setSyntheticPageSpreadStyle();
            });
        }
        else {

            _.each(this.get("fixedPages"), function (fixedPageInfo) {
                fixedPageInfo.fixedPageView.setSinglePageSpreadStyle();
            });
        }

        // Rationale: This method toggles the page numbers
        newPageNumbers = this.fixedPagination.getPageNumbersForTwoUp(this.get("currentPages"), undefined, this.get("pageProgressionDirection"));
        this.resetCurrentPages(newPageNumbers);
    },

    // -------------------------------------------- PRIVATE HELPERS ---------------------------------

    hidePageViews : function () {

        _.each(this.get("fixedPages"), function (fixedPageInfo) {
            fixedPageInfo.fixedPageView.hidePage();
        });      
    },

    numberOfPages : function () {

        return this.get("fixedPages").length;
    },

    initializeFixedImagePageInfo: function (spineObject, imageSrc, viewerSettings, fixedPageViewInfo, callback) {
        var that = this;
        var fixedPageView;
        fixedPageView = that.initializeImagePage(spineObject.pageSpread, imageSrc, viewerSettings);
        // Initialize info object
        fixedPageViewInfo.fixedPageView = fixedPageView;
        fixedPageView.pageType = spineObject.fixedLayoutType;
        fixedPageView.isRendered = false;
        fixedPageView.spineIndex = spineObject.spineIndex;

        callback();
    },
    loadPageViews : function (viewerSettings, finishCallback) {

        var that = this;
        var epubFetch = this.get('epubFetch');
        var initializationDeferreds = [];
        _.each(this.get("spineObjects"), function (spineObject) {

            var spineObjectInitializationDeferred = $.Deferred();
            initializationDeferreds.push(spineObjectInitializationDeferred);
            var fixedPageViewInfo = {};
            if (spineObject.fixedLayoutType === "image") {
                var imageSrc = spineObject.contentDocumentURI;
                console.log('initializing ImagePage, spineObject.contentDocumentURI: ' + imageSrc);
                if (!epubFetch.isPackageExploded()) {
                    // FIXME: make sure the path's relative to package
                    epubFetch.relativeToPackageFetchFileContents(imageSrc, 'blob', function (imageData) {
                        imageSrc = window.URL.createObjectURL(imageData);

                        that.initializeFixedImagePageInfo(spineObject, imageSrc, viewerSettings, fixedPageViewInfo, spineObjectInitializationDeferred.resolve);
                    }, function (err) {
                        console.error('Fatal ERROR when initializing ImagePage:');
                        console.error(err);
                    })
                } else {
                    that.initializeFixedImagePageInfo(spineObject, imageSrc, viewerSettings, fixedPageViewInfo, spineObjectInitializationDeferred.resolve);
                }
            }
            // SVG and all others
            else {
                var fixedPageView;
                console.log('initializing FixedPage, spineObject.contentDocumentURI: ' + spineObject.contentDocumentURI)
                fixedPageView = that.initializeFixedPage(spineObject.pageSpread, spineObject.contentDocumentURI, viewerSettings);
                // TODO: create fixedPageViewInfo, push onto that.get("fixedPages")?
                spineObjectInitializationDeferred.resolve();
            }
            that.get("fixedPages").push(fixedPageViewInfo);
        });
        $.when.apply($, initializationDeferreds).done(function() {
            console.log('all fixed page deferreds done.');
            // TODO: call once, after the last _.each!
            finishCallback();
        });
    },

    // REFACTORING CANDIDATE: the pageSetEventContext can be used to trigger the epubLoaded event; also, epubLoaded 
    //   should be renamed to something like pageSetLoaded.
    renderAll : function (bindingElement, linkClickHandler, handlerContext) {

        var that = this;
        var numFixedPages = this.get("fixedPages").length;
        
        _.each(this.get("fixedPages"), function (fixedPageViewInfo) {

            fixedPageViewInfo.fixedPageView.on("contentDocumentLoaded", function (viewElement) { 

                fixedPageViewInfo.isRendered = true;
                fixedPageViewInfo.fixedPageView.hidePage();

                numFixedPages = numFixedPages - 1;

                console.log('rendered page, numfixedpages: ' + numFixedPages);
                if (numFixedPages === 0) {
                    console.log('triggering epubLoaded');
                    console.trace();
                    that.trigger("epubLoaded");
                }
            });
            
            that.addPageViewToDom(bindingElement, fixedPageViewInfo.fixedPageView.render(false, undefined, linkClickHandler, handlerContext));
        });

        setTimeout(function () { 
            
            if (numFixedPages != 0) {
                // throw an exception
            }

        }, 1000);
    },

    addPageViewToDom : function (bindingElement, pageViewElement) {

        $(bindingElement).append(pageViewElement);
    },

    resetCurrentPages : function (currentPages) {

        this.set("currentPages", currentPages);
        this.hidePageViews();

        if (currentPages[0] !== undefined && currentPages[0] !== null) {
            this.getPageViewInfo(currentPages[0]).fixedPageView.showPage();
        }

        if (currentPages[1] !== undefined && currentPages[1] !== null) {
            this.getPageViewInfo(currentPages[1]).fixedPageView.showPage();
        }
    },

    getPageViewInfo : function (pageNumber) {

        var pageIndex = pageNumber - 1;
        return this.get("fixedPages")[pageIndex];
    },

    initializeImagePage : function (pageSpread, imageSrc, viewerSettings) {

        console.log('initializeImagePage imageSrc: ' + imageSrc);

        return new EpubFixed.ImagePageView({
                        pageSpread : pageSpread,
                        imageSrc : imageSrc,
                        viewerSettings : viewerSettings
                    });
    },

    initializeFixedPage : function (pageSpread, iframeSrc, viewerSettings) {

        return new EpubFixed.FixedPageView({
                        pageSpread : pageSpread,
                        iframeSrc : iframeSrc,
                        viewerSettings : viewerSettings
                    });
    },

    resizePageViews : function () {

        _.each(this.get("fixedPages"), function (fixedPageViewInfo) {
            fixedPageViewInfo.fixedPageView.setPageSize();
        });
    }
});