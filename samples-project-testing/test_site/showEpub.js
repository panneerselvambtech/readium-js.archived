
RWCDemoApp = {};

RWCDemoApp.getInputValue = function (inputId) {
    return $("#" + inputId).val();
};

RWCDemoApp.setModuleContainerHeight = function () {
    $("#epub-reader-container").css({ "height" : $(document).height() * 0.85 + "px" });
};

// This function will retrieve a package document and load an EPUB
RWCDemoApp.loadAndRenderEpub = function (packageDocumentURL) {

    var libDir = '../lib/';

    var that = this;

    // Clear the viewer, if it has been defined -> to load a new epub
    RWCDemoApp.epubViewer = undefined;


    // Get the HTML element to bind the module reader to
    var elementToBindReaderTo = $("#reader");

    // Create an object of viewer preferences
    var viewerPreferences = {
        fontSize: 12,
        syntheticLayout: false,
        currentMargin: 3,
        tocVisible: false,
        currentTheme: "default"
    };
    var currLayoutIsSynthetic = viewerPreferences.syntheticLayout;

    // THE MOST IMPORTANT PART - INITIALIZING THE SIMPLE RWC MODEL
    RWCDemoApp.epubViewer =
        new SimpleReadiumJs(elementToBindReaderTo, viewerPreferences, packageDocumentURL, libDir, "lazy",
            function (epubViewer) {
                RWCDemoApp.epubViewer = epubViewer;
                // Set a fixed height for the epub viewer container, as a function of the document height
                RWCDemoApp.setModuleContainerHeight();

                // These are application specific handlers that wire the HTML to the SimpleRWC module API
                /*
                 // Set handlers for click events
                 $("#previous-page-btn").unbind("click");
                 $("#previous-page-btn").on("click", function () {
                 RWCDemoApp.epubViewer.previousPage(function () {
                 console.log("went to previous page");
                 });
                 });

                 $("#next-page-btn").unbind("click");
                 $("#next-page-btn").on("click", function () {
                 RWCDemoApp.epubViewer.nextPage(function () {
                 console.log("went to next page");
                 });
                 });

                 $("#toggle-synthetic-btn").unbind("click");
                 $("#toggle-synthetic-btn").on("click", function () {

                 if (currLayoutIsSynthetic) {
                 RWCDemoApp.epubViewer.setSyntheticLayout(false);
                 currLayoutIsSynthetic = false;
                 $("#single-page-ico").show();
                 $("#synthetic-page-ico").hide();
                 }
                 else {
                 RWCDemoApp.epubViewer.setSyntheticLayout(true);
                 currLayoutIsSynthetic = true;
                 $("#single-page-ico").hide();
                 $("#synthetic-page-ico").show();
                 }
                 });
                 */

                var pressLeft = function () {
                    console.log('showEpub.js: pressed left.');
                    RWCDemoApp.epubViewer.previousPage();
                };
                var pressRight = function () {
                    console.log('showEpub.js: pressed right.');
                    RWCDemoApp.epubViewer.nextPage();
                };

                RWCDemoApp.epubViewer.on("keydown-left", pressLeft, that);
                RWCDemoApp.epubViewer.on("keydown-right", pressRight, that);

                console.log('registering handlers for btn-left and btn-right');
                $("#btn-left").on("click", function () {
                    pressLeft();
                });
                $("#btn-right").on("click", function () {
                    pressRight();
                });


                RWCDemoApp.epubViewer.on("internalLinkClicked", function (e) {
                    var href;
                    e.preventDefault();

                    // Check for both href and xlink:href attribute and get value
                    if (e.currentTarget.attributes["xlink:href"]) {
                        href = e.currentTarget.attributes["xlink:href"].value;
                    } else {
                        href = e.currentTarget.attributes["href"].value;
                    }

                    var spineIndex = RWCDemoApp.epubViewer.findSpineIndex(href);
                    RWCDemoApp.epubViewer.showSpineItem(spineIndex);

                }, that);

                // Render the reader
                RWCDemoApp.epubViewer.on("epubLoaded", function () {
                    RWCDemoApp.epubViewer.showSpineItem(0, function () {
                        console.log("showed first spine item");
                        $('#para-messages').text('');

                        //								alert("Reading System name: " + navigator.epubReadingSystem.name);
                    });
                }, that);

                RWCDemoApp.epubViewer.render(0);
            });
};


var testEpub = function (packageDocumentPath) {

    var url = "../epub_samples_project/" + packageDocumentPath;
    RWCDemoApp.loadAndRenderEpub(url);
	
	/*
    var that = this;
    this.view = showEpub("/epub_samples_project/" + packageDocumentPath);
	
	if (typeof this.view == "undefined")
	{
		var url =
		window.location + "/" +
		"../.."
		+ "/epub_samples_project/" + packageDocumentPath;
		console.log("Server not running? Trying local (RECOMMENDED: GoogleChrome.app --args --disable-application-cache --disable-web-security -–allow-file-access-from-files --incognito): " + url);
		
		this.view = showEpub(url);
	}

    var pressLeft = function () { that.view.previousPage(); };
    var pressRight = function () { that.view.nextPage(); };

    this.view.on("keydown-left", pressLeft, this);
    this.view.on("keydown-right", pressRight, this);

    this.view.on("internalLinkClicked", function(e){
        var href;
        e.preventDefault();

        // Check for both href and xlink:href attribute and get value
        if (e.currentTarget.attributes["xlink:href"]) {
            href = e.currentTarget.attributes["xlink:href"].value;
        }
        else {
            href = e.currentTarget.attributes["href"].value;
        }

        var spineIndex = this.view.findSpineIndex(href);
        this.view.showSpineItem(spineIndex);

    }, this);

    this.view.on("epubLoaded", function () { 

		alert("HERE");

        this.view.showSpineItem(0, function () {
            console.log("showed first spine item"); 
        });
    }, this);

    this.view.render(0);
	*/
};
