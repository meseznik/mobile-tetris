/* global module:true */
module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    connect: {
      server: {
        options: {
          base: 'front/',
          //directory: 'front/',
          //livereload: true,
          middleware: function (connect, options, middlewares) {
                   // inject a custom middleware
                   middlewares.unshift(function (req, res, next) {
                       res.setHeader('Access-Control-Allow-Origin', '*');
                       res.setHeader('Access-Control-Allow-Methods', '*');
                       //a console.log('foo') here is helpful to see if it runs
                       return next();
                   });

                   return middlewares;
               }
        }
      }
    },

    watch: {
      options: {
        //livereload: true
      },
      files: ['front/**/*']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('server', ['connect','watch']);
};
