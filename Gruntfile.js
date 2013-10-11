module.exports = function(grunt) {
    "use strict"; 
    
    //usage: grunt [server | watch | (--minify 1 &| --syncload)]
    //server: Start a testing server for the website.
    //watch: Automatically recompile part of the project when files are changed.
    //--minify: Compress the build. (Has no effect when server option in use.)
    //--syncload: Generate syncload javascript. TODO: Insert short description of syncload here. (Has no effect when server option in use.)
    
    // Compile a list of paths and output files for our modules for requirejs to compile.
    // TODO: Translate the command-line code to this.
    var configRequireJSCompilePaths = {};
    function add_require_configuration(module) {
        var epub = module.folder_name;
        var epub_module = module.output_file;
        configRequireJSCompilePaths[epub] =  { 
            options: {
                mainConfigFile: "epub-modules/"+epub+"/build.js",
                name: epub_module,
                baseUrl: "epub-modules/"+epub+"/src",
                optimize: "none",
                out: "epub-modules/"+epub+"/out/"+epub_module+".js",
                useSourceUrl: true,
                logLevel: 2,
            }
        };
    }
    
    [   {folder_name:"epub",          output_file:"epub_module"},
        {folder_name:"epub-cfi",      output_file:"cfi_module"},
        {folder_name:"epub-ers",      output_file:"epub_reading_system"},
        {folder_name:"epub-fetch",    output_file:"epub_fetch_module"},
        {folder_name:"epub-renderer", output_file:"epub_renderer_module"},
    ].forEach(add_require_configuration);
    

    configRequireJSCompilePaths["readium-js"] =  { 
        options: {
            mainConfigFile: "epub-modules/readium-js/build.js",
            name: "Readium",
            baseUrl: "epub-modules/readium-js/src",
            optimize: grunt.option('minify')?"uglify2":"none",
            out: "epub-modules/readium-js/out/Readium" + 
                (grunt.option('syncload')?".syncload":"") + 
                (grunt.option('minify')?".min":"") + ".js",
            include: grunt.option('syncload')?"define-sync":undefined,
            almond: grunt.option('minify'),
            wrap: grunt.option('syncload')?{
                startFile: "epub-modules/readium-js/wrap-sync-start.frag.js",
                endFile: "epub-modules/readium-js/wrap-sync-end.frag.js",
            }:undefined,
            useSourceUrl: true,
            logLevel: 2,
        }
    };
    
    
    //Generate a config map of projects to watch.
    var watchTasks = {};
    ["epub-cfi", "epub-fetch", "epub", "epub-ers", "epub-renderer", ].forEach(function(module) {
        watchTasks[module] = {
            files: ['epub-modules/'+module+'/src/**/*.js'],
            tasks: ['requirejs:'+module, 'requirejs:readium-js', 'copy', 'notify:done', ],
            options: {
                livereload: true,
                interrupt: true,
            },
        };
    });
    watchTasks["readium-js"] = {
        files: ['epub-modules/readium-js/src/**/*.js'],
        tasks: ['requirejs:readium-js', 'copy', 'notify:done', ],
        options: {
            livereload: true,
            interrupt: true,
        },
    };
    
    
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        requirejs: configRequireJSCompilePaths,
        watch: watchTasks,
        
        copy: {
            libs_to_test_site: {
                files: [{
                    expand: true, src: ['**'], 
                    cwd: "epub-modules/lib/", 
                    dest: 'samples-project-testing/lib/',
                },{
                    expand: true, src: ['*'], 
                    cwd: 'epub-modules/readium-js/out/', 
                    dest: 'samples-project-testing/lib/readium-js/', 
                    filter: 'isFile',
                }]
            }
        },
        
        exec: {
            start_example_server: {
                cmd: 'node test_site_server.js',
                cwd: 'samples-project-testing',
            },
        },
        
        notify: {
            done: {
                options: {
                    title: 'Successful recompile.',
                    message: 'Your javascript changes are now live.',
                }
            },
        },
    };
    
    grunt.initConfig(config);
    
    //Load all our package.json-included grunt modules.
    require('load-grunt-tasks')(grunt);
    
    
    grunt.registerTask('msg', 'Print a helpful message. (:server or :ran)', function(msg) {
        var width = 80;
        switch(msg) { 
            case 'server': grunt.log.writeln(grunt.log.wraptext(width, "Now serving the example site for you at"));
                           grunt.log.subhead("http://localhost:3000/test_site/reader_view.html");
                           break;
            case 'ran': grunt.log.subhead("What Next?");
                        grunt.log.writeln(grunt.log.wraptext(width, "Now we\'ve compiled the javascript files. We can include them in our project, as shown in the example in samples-project-testing/test_site. To view the site, run"));
                        grunt.log.ok("grunt server");
                        grunt.log.writeln(grunt.log.wraptext(width, "\nIf you\'re a developer, you can make grunt automatically recompile the javascript when changes are made. (This is a partial recompile, faster than the default build.) Run:"));
                        grunt.log.ok("grunt watch");
                        grunt.log.writeln(grunt.log.wraptext(width, "\nTo build only the readium project, run 'grunt build_epub_modules'. You may specify --minify 1 and/or --syncload to compress and enable synchronous loading, a.k.a. tag loading, of the Javascript."));
        }
    });
    
    grunt.registerTask('default', 'Compile the readium-web-components project.', [
        'requirejs',            //Builds the libraries we need. 
        'copy',                 //Copy them to the test server. 
        'notify:done',          //Be useful. Prompt next steps. 
        'msg:ran',   
    ]);
    
    grunt.registerTask('server', 'Starts a server and opens the testing webpage.', [
        'msg:server',
        'exec:start_example_server',
    ]);
};
