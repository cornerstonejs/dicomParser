module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: [
                    'dist',
                    'docs',
                    'build'
                    ],
        copy: {
            bower: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/jquery/dist/jquery.min.map',
                    'bower_components/bootstrap/dist/css/bootstrap.min.css',
                ],
                dest: 'examples',
                expand: true,
                flatten: true
            },
            meteor : {
                src: [
                    'meteor/dicomParser/package.js',
                ],
                dest: 'dist',
                expand: true,
                flatten: true
            }
        },
        version: {
          // options: {},
          defaults: {
            src: ['src/version.js', 'meteor/dicomParser/package.js', 'bower.json']
          }
        },
        concat: {
            build: {
                src : ['src/misc/header.js', 'src/parseDicom.js', 'src/util/*.js',
                       'src/readEncapsulatedPixelData.js',
                       'src/*.js', 'src/misc/footer.js',],
                dest: 'build/built.js'
            },
            dist: {
                options: {
                    stripBanners: true,
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> ' +
                        '| (c) 2014 Chris Hafey | https://github.com/chafey/dicomParser */\n'
                },
                src : ['build/built.js'],
                dest: 'dist/dicomParser.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    'dist/dicomParser.min.js': ['dist/dicomParser.js']
                }
            },
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> ' +
                    '| (c) 2014 Chris Hafey | https://github.com/chafey/dicomParser */\n'
            }
        },
        jshint: {
            files: [
                'src/*.js'
            ]
        },
        qunit: {
            all: ['test/*.html']
        },
        jsdoc : {
            dist : {
                src: ['src/*.js', 'test/*.js'],
                options: {
                    destination: 'docs'
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/*.js', 'test/*.js', 'src/util/*.js'],
                tasks: ['concat:build', 'concat:dist', 'jshint', 'qunit']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('buildAll', ['clean','concat:build', 'concat:dist', 'uglify', 'copy:meteor', 'jshint', 'qunit']);
    grunt.registerTask('default', ['buildAll']);
};

// Release process:
//  1) Update version numbers in bower.json, package.json and meteor/package.js
//      grunt version
//  2) do a build (needed to update dist versions with correct build number)
//      grunt
//  3) commit changes
//      git commit -am "Changes...."
//  4) tag the commit
//      git tag -a 0.1.0 -m "Version 0.1.0"
//  5) push to github
//      git push origin master --tags
//  6) Update atmosphere
//      meteor publish
//  7) Update npm
//      npm publish
