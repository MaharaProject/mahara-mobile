// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Moodle mobile file system lib.
 * @author <a href="mailto:jleyva@cvaconsulting.com">Juan Leyva</a>
 * @version 1.2
 */


/**
 * @namespace Holds all the MoodleMobile file system functionality.
 */

 /* global LocalFileSystem */
 // LocalFileSystem always called after device is ready
const fsLib = {

    basePath: '',
    defaultSize: 0,

    init: function(callBack) {
        console.log('Loading File System');

        // This means that or Cordova or the emulator are not yet loaded, so we must delay this.
        if (typeof(LocalFileSystem) == "undefined") {
            console.log("LocalFileSystem not defined yet");
            setTimeout(function() {
                fsLib.init(callBack);
            }, 5000);
            return;
        }

        // TODO?
        // if( MM.getOS() == 'android' && typeof(MM.config.app_id) == "undefined" ){
        //     console.log("MM.config not defined yet", "FS");
        //     setTimeout(function() {
        //         fsLib.init(callBack);
        //     }, 2000);
        //     return;
        // }

        if (!callBack) {
            callBack = function() {};
        }

        if (fsLib.loaded()) {
            // The file system was yet loaded.
            console.log('The file system was previously loaded', 'FS');
            callBack();
            return;
        }

//         if (cordova.platformId == 'android') {
//             // TODO? Unique directory for each instance of the app?
// //            fsLib.basePath = 'Android/data/' + MM.config.app_id;
//             fsLib.basePath = cordova.file.externalApplicationStorageDirectory;
//             console.log("Android device file path " + fsLib.basePath, "FS");
//         }
        fsLib.loadFS(callBack);
    },

    loaded: function() {
        return typeof(fsLib.fileSystemRoot) != 'undefined';
    },

    getRoot: function() {
        if (!fsLib.fileSystemRoot) {
            fsLib.loadFS(function() {
                fsLib.entryURL(fsLib.fileSystemRoot);
            });
        } else {
            var path = fsLib.entryURL(fsLib.fileSystemRoot);
            // Android 4.2 and onwards
            //path = path.replace("storage/emulated/0", "sdcard");
            // Delete last / if present.
            return path.replace(/\/$/, '');
        }
    },

    loadFS: function(callBack) {
        console.log("Requesting file system size: " + fsLib.defaultSize, "FS");
        window.requestFileSystem(LocalFileSystem.PERSISTENT, fsLib.defaultSize,
            function(fileSystem) {
                console.log("FileSystem quota: " + fsLib.defaultSize, "FS");
                fsLib.fileSystemRoot = fileSystem.root;
                if (fsLib.basePath) {
                    fsLib.fileSystemRoot.getDirectory(
                        fsLib.basePath, {create: true, exclusive: false},
                        function(entry) {
                            fsLib.fileSystemRoot = entry;
                            callBack();
                        },
                        function(err) {
                            var msg = 'Critical error accessing file system, directory ' + fsLib.basePath + ' can\'t be created';
                            console.log(msg, "FS");
                            if (err) {
                                console.log(err);
                                //console.log("Error dump", "FS");
                            }
                            // TODO: lang string
                            alertify.alert(msg);
                        }
                    );
                } else {
                    callBack();
                }
            }, function() {
                console.log("Critical error accessing file system", "FS");
                // TODO: lang string
                alertify.alert('Critical error accessing file system');
            }
       );
    },

    fileExists: function(path, successCallback, errorCallback) {
        var directory = path.substring(0, path.lastIndexOf('/') );
        var filename = path.substr(path.lastIndexOf('/') + 1);
        fsLib.fileSystemRoot.getDirectory(
            directory,
            { create: false },
            function(entry) {
                entry.getFile(
                    filename, { create: false },
                    function(entryFile) {
                        successCallback(fsLib.entryURL(entryFile));
                    },
                    errorCallback
                );
            },
            errorCallback
        );
    },

    createDir: function(path, successCallback, dirEntry) {
        path = path.replace('file:///', '');

        console.log('FS: Creating full directory ' + path, 'FS');

        var paths = path.split('/');

        var baseRoot = fsLib.fileSystemRoot;
        if (dirEntry) {
            baseRoot = dirEntry;
        }

        console.log('FS: Creating directory ' + paths[0] + ' in ' + fsLib.entryURL(baseRoot), 'FS');
        baseRoot.getDirectory(
            paths[0],
            {create: true, exclusive: false},
            function(newDirEntry) {
                if (paths.length == 1) {
                    successCallback(newDirEntry);
                    return;
                }
                // Recursively, create next directories
                paths.shift();
                fsLib.createDir(paths.join('/'), successCallback, newDirEntry);
            },
            function(err) {
                // TODO: lang string
                alertify.alert('Critical error creating directory: ' + paths[0]);
                if (err) {
                    console.log("Error dump", "FS");
                }
            }
        );
    },

    /**
     * Remove recursively a directory
     * @param  {string} path            The relative path of the directory
     * @param  {object} successCallback Success callback function
     * @param  {object} errorCallback   Error callback function
     */
    removeDirectory: function(path, successCallback, errorCallback) {
        console.log('FS: Removing full directory ' + path, 'FS');

        var baseRoot = fsLib.fileSystemRoot;
        if (!baseRoot) {
            errorCallback();
            return;
        }
        baseRoot.getDirectory(
            path,
            {create: false, exclusive: false},
            function(dirEntry) {
                dirEntry.removeRecursively(successCallback, errorCallback);
            },
            errorCallback
        );
    },

    /**
     * Remove a file
     * @param  {string} path            The relative path of the file
     * @param  {object} successCallback Success callback function
     * @param  {object} errorCallback   Error callback function
     */
    removeFile: function(path, successCallback, errorCallback) {
        console.log('FS: Removing file ' + path, 'FS');

        var baseRoot = fsLib.fileSystemRoot;
        if (!baseRoot) {
            if(errorCallback) {
                errorCallback();
            }
            return;
        }
        baseRoot.getFile(
            path,
            {create: false, exclusive: false},
            function(fileEntry) {
                fileEntry.remove(successCallback, errorCallback);
            },
            errorCallback
        );
    },

    /**
     * Recursive and asynchronous function for calculating the size of a directory.
     * We use several controls global vars in order to know when the algorithm has finished.
     *
     * @param  {string} path                Relative path to the directory
     * @param  {[type]} successCallback     Success Callback
     * @param  {[type]} errorCallback       Error Callback
     */
    directorySize: function(path, successCallback, errorCallback) {
        var baseRoot = fsLib.fileSystemRoot;
        var fileCounter = 1;    // Are files sizes pending to be retrieved?
        var totalSize = 0;      // Total size of files.
        var running = 0;        // There are async calls pending?
        var directoryReader;

        console.log('Calculating directory size: ' + path , 'FS');
        var sizeHelper = function(entry) {
            if (entry.isDirectory) {
                fileCounter--;
                running++;
                directoryReader = entry.createReader();
                directoryReader.readEntries(function(entries) {
                    running--;
                    fileCounter += entries.length;
                    if (!fileCounter && !running) {
                        console.log('Directory size for: ' + path + ' is ' + totalSize + ' bytes', 'FS');
                        successCallback(totalSize);
                    }
                    var i;
                    for (i=0; i<entries.length; i++) {
                        sizeHelper(entries[i]);
                    }
                }, errorCallback);
            } else if (entry.isFile) {
                entry.file(
                    function(file) {
                        totalSize += file.size;
                        fileCounter--;
                        if (!fileCounter && !running) {
                            console.log('Directory size for: ' + path + ' is ' + totalSize + ' bytes', 'FS');
                            successCallback(totalSize);
                        }
                    },
                    function() {
                        fileCounter--;
                        if (!fileCounter && !running) {
                            console.log('Directory size for: ' + path + ' is ' + totalSize + ' bytes', 'FS');
                            successCallback(totalSize);
                        }
                    });
            } else {
                fileCounter--;
            }
        };

        if (baseRoot) {
            baseRoot.getDirectory(
                path,
                {create: false},
                function(entry) {
                    sizeHelper(entry);
                },
                function() {
                    errorCallback();
                }
            );
        } else {
            errorCallback();
        }
    },


    /**
     * Asynchronous function for retrieving the contents of a directory (not subdirectories)
     *
     * @param  {string} path                Relative path to the directory
     * @param  {[type]} successCallback     Success Callback
     * @param  {[type]} errorCallback       Error Callback
     */
    getDirectoryContents: function(path, successCallback, errorCallback) {
        var baseRoot = fsLib.fileSystemRoot;
        var directoryReader;

        console.log('Reading directory contents: ' + path , 'FS');
        var contentsHelper = function(entry) {
            directoryReader = entry.createReader();
            directoryReader.readEntries(function(entries) {
                successCallback(entries);
            }, errorCallback);
        };

        if (baseRoot) {
            baseRoot.getDirectory(
                path,
                {create: false},
                function(entry) {
                    contentsHelper(entry);
                },
                function() {
                    console.log('Directory doesn\'t exist: ' + path , 'FS');
                    errorCallback();
                }
            );
        } else {
            errorCallback();
        }
    },

    /**
     * This function attemps to calculate the free space in the disck (or sandbox or whatever)
     * Since there is not Phonegap API, what we do is request a file system instance with a minimum size until we get an error
     * We call this function two times for accurate results.
     *
     * @param  {object} callBack        Success callback
     * @param  {object} errorCallback   Error Callback
     * @return {float}                  The estimated free space in bytes
     */
    calculateFreeSpace: function(callBack, errorCallback) {

        var tooMuch = false;
        var tooLessCounter = 0;
        var iterations = 50;

        const calculateByRequest = function(size, ratio, iterations, callBack) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, size,
                function() {

                    tooLessCounter++;

                    if (tooMuch) {
                        callBack(size);
                        return;
                    }
                    // This is to prevent infinite loops.
                    if (tooLessCounter > iterations) {
                        return;
                    }
                    calculateByRequest(size * ratio, ratio, iterations, callBack);
                },
                function() {
                    tooMuch = true;
                    calculateByRequest(size / ratio, ratio, iterations, callBack);
                }
            );
        };

        if (window.requestFileSystem) {
            // General calculation, base 1MB and increasing factor 1.3.
            calculateByRequest(1048576, 1.3, iterations, function(size) {
                tooMuch = false;
                tooLessCounter = 0;
                iterations = 10;
                // More accurate. Factor is 1.1.
                calculateByRequest(size, 1.1, iterations, callBack);
            });
        } else {
            errorCallback();
        }
    },

    /**
     * Helper function for using the correct available method since toNativeURL is Cordova specific
     * @param  {object} entry File/Directory entry
     * @return {string}       URL for the file
     */
    entryURL: function(entry) {
        if (typeof(entry.toURL) == "function") {
            return entry.toURL();
        } else {
            return entry.toNativeURL();
        }
    },

    /**
     * Finds a file and reats its contents.
     *
     * @param {String} filepath Path of the file to get.
     * @param {Function} successCallBack Function to be called when the contents are retrieved.
     * @param {Function} errorCallBack Function to be called if it fails.
     * @param {Object} dirEntry Directory to search in (optional).
    */
    findFileAndReadContents: function(filename, successCallBack, errorCallBack, dirEntry){

        // Delete file protocols for Chromium.
        filename = filename.replace("filesystem:file:///persistent/", "");

        console.log('Find file and read contents. ' + filename);

        var baseRoot = fsLib.fileSystemRoot;
        if (dirEntry) {
            baseRoot = dirEntry;
        }

        baseRoot.getFile(
            filename, { create: false, exclusive: false },
            function(fileEntry) {

                fileEntry.file(
                    function(file){
                        var reader = new FileReader();
                        reader.onloadend = function (evt) {
                            successCallBack(evt.target.result);
                        };
                        reader.onerror = function() {
                            errorCallBack(3);
                        };
                        reader.readAsText(file);
                    },
                    function() {
                        errorCallBack(2);
                    }
                );
            },
            function() {
                errorCallBack(1);
            }
        );
    },

    /**
     * Normalize a filename that usually comes URL encoded.
     * @param  {string} filename The file name
     * @return {string}          The file name normalized
     */
    normalizeFileName: function(filename) {
        filename = decodeURIComponent(filename);
        return filename;
    },

    /**
     * Gets a file and writes some data in it.
     *
     * @param {String} filepath Path of the file to get.
     * @param {String} content Data to write in the file.
     * @param {Function} successCallBack Function to be called when the file is written.
     * @param {Function} successCallBack Function to be called if it fails.
     */
    getFileAndWriteInIt: function(filepath, content, successCallBack, errorCallBack) {

        fsLib.createFile(filepath,
            function(fileEntry){
                fsLib.writeInFile(fileEntry, content, successCallBack);
            },
            errorCallBack
        );
    },

    /**
     * Writes some data in a file.
     *
     * @param {Object} fileEntry FileEntry of the file to write in.
     * @param {String} content Data to write in the file.
     * @param {Function} successCallBack Function to be called when the file is written.
     */
    writeInFile: function(fileEntry, content, successCallBack) {

        var time = new Date().getTime();

        fileEntry.createWriter(
            function(writer){
                writer.onwrite = function(){
                    console.log('Write file '+fileEntry.name+'. Time: '+ (new Date().getTime() - time) );
                    if(successCallBack){
                        successCallBack( fsLib.entryURL(fileEntry));
                    }
                };
                // TODO?
                // if(MM.inMMSimulator) {
                //     writer.write(new Blob([content], {type: 'text/plain'}) );
                // } else {
                    writer.write(content);
                // }
            },
            function(error){
                console.log('Error writing file: '+fileEntry.name);
            }
        );
    },

    /**
     * Creates a file.
     *
     * @param {string} path Path of the file to create.
     * @param {Function} successCallBack Function to be called when the file is created.
     * @param {Function} errorCallBack Function to be called when an error occurs.
     * @param {Object} dirEntry Directory where the file will be created (optional).
     */
    createFile: function(path, successCallBack, errorCallBack, dirEntry) {

        // Delete file protocols for Chromium and iOs.
        path = path.replace("filesystem:file:///persistent/", "");
        path = path.replace('file:///', '');

        var paths = path.split('/');
        var filename = path.substr(path.lastIndexOf('/') + 1);

        var baseRoot = fsLib.fileSystemRoot;
        if (dirEntry) {
            baseRoot = dirEntry;
        }

        console.log('FS: Creating file ' + path + ' in ' + baseRoot.fullPath);

        if( paths.length > 1){

            var directory = path.substring(0, path.lastIndexOf('/') );

            fsLib.createDir(directory, function(subdirEntry){

                subdirEntry.getFile(filename, {create: true},
                    function(fileEntry){
                        successCallBack(fileEntry);
                    },
                    errorCallBack);

            }, dirEntry);

        }
        else{
            baseRoot.getFile(filename, {create: true}, successCallBack, errorCallBack);
        }
    },

    /**
     * Gets a file that might be outside the app's folder.
     *
     * @param  {String} fileURI         Path to the file to get.
     * @param  {object} successCallBack Function to be called when the file is retrieved.
     * @param  {object} errorCallBack   Function to be called when an error occurs.
     */
    getExternalFile: function(fileURI, successCallBack, errorCallBack) {
        window.resolveLocalFileSystemURL(fileURI, successCallBack, errorCallBack);
    },

    /**
     * Remove a file that might be outside the app's folder.
     * @param  {string} path            The absolute path of the file
     * @param  {object} successCallback Success callback function
     * @param  {object} errorCallback   Error callback function
     */
    removeExternalFile: function(path, successCallback, errorCallback) {
        console.log('FS: Removing file ' + path, 'FS');

        fsLib.getExternalFile(path, function(fileEntry){
            fileEntry.remove(successCallback, errorCallback);
        }, errorCallback);
    },

    /**
     * Reads a file as an ArrayBuffer.
     *
     * @param  {String} file            File to read.
     * @param  {object} successCallback Function to be called when the file is retrieved.
     * @param  {object} errorCallback   Function to be called when an error occurs.
     */
    readFileAsArrayBuffer: function(file, successCallback, errorCallback) {
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            successCallback(evt.target.result);
        };
        reader.onerror = function() {
            errorCallback();
        };
        reader.readAsArrayBuffer(file);
    }
};
export default fsLib;
