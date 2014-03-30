module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            default: {
                src: [
                    'dist',
                    'docs'
                ]
            }
        },
        concat: {
            dist: {
                src : ['src/*.js'],
                dest: 'dist/dicomParser.js'
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
                files: ['src/*.js', 'test/*.js'],
                tasks: ['concat', 'jshint', 'qunit']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('buildAll', ['clean','concat', 'jshint', 'qunit']);
    grunt.registerTask('default', ['buildAll']);
};