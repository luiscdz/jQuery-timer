;(function ( $, window, document, undefined ) {

	"use strict";
		
		var pluginName = "timer",
            defaults = {
				duration : 60,
                start : 60,
                append : true,
                direction: "backward",
                debug: true,
                autoRun : true,
                onFinish :function(){},
                onStart : function(){},
                onStop : function(){}
		};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don't want to alter the default options for
				// future instances of the plugin
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}		
        
        // privates method
        var _ = {
            cache :{
                current : 0            
            },  
            debug : function(obj) {
                if (window.console && window.console.log){            
                    window.console.log(obj);              
                }
            },
            itemsImage: {},
            intervalTimer: "",
            contentTimer:"",
            status: false,
            render: function( settings, element ){
               
                var display;
                var backLeft;
                var backRight;
                var rotateLetf;
                var rotateRight;
                var html;
                var tempDiv;
                                
                display = "<div class='display'></div>";
                backLeft = "<div class='bg backLeft'></div>";  
                backRight = "<div class='bg backRight'></div>";   
                rotateLetf = "<div class='rotate left'><div class='bg left'></div></div>";
                rotateRight = "<div class='rotate right'><div class='bg right'></div></div>";                    

                html = display +  backLeft + rotateLetf +  backRight + rotateRight;

                // Creating a new element and setting the color as a class name:
                tempDiv = $( "<div>" ).attr( "class", "blue clock" ).html( html );
                this.contentTimer = $( tempDiv );
                
                // Appending to the container:
                if( settings.append === true ){                 
                    $( element ).append( tempDiv );
                }else if( settings.append === false ){
                    $( element ).html( tempDiv );
                }
                
                this.cache.current = settings.start;               
                
                // Assigning some of the elements as variables for speed
                // Adding the dial as a global variable. Will be available as itemsImage
                this.itemsImage.rotateLeft = tempDiv.find( ".rotate.left" );
                this.itemsImage.rotateRight = tempDiv.find( ".rotate.right" );
                this.itemsImage.display = tempDiv.find( ".display" );   
                
                this.itemsImage.display.html( settings.start );
            },
            animationBackward: function( clock, current, total ){ 
                                
                // Calculating the current angle:
                var angle = total === current ? 360: ( 360  / total ) * ( current );
                angle < current - 1 ? 0 : angle;

                var element;

                if( current == 0 ){
                    // Hiding the right half of the background:
                    clock.rotateLeft.hide();

                    // Resetting the rotation of the left part:
                    this.rotateElement( clock.rotateLeft, 0 );
                }

                if( angle <= 180){
                    // The left part is rotated, and the right is currently hidden:
                    element = clock.rotateLeft;
                    clock.rotateRight.hide();
                }
                else{
                    // The first part of the rotation has completed, so we start rotating the right part:
                    clock.rotateRight.show();
                    clock.rotateLeft.show();

                    this.rotateElement( clock.rotateLeft, 180 );

                    element = clock.rotateRight;
                    angle = angle - 180;
                }

                this.rotateElement( element, angle );

                // Setting the text inside of the display element, inserting a leading zero if needed:
                clock.display.html( current < 10 ? '0' + current : current );
                
                //subtracted one at start value
                this.cache.current = this.cache.current - 1;
            },
            rotateElement : function( element, angle ){

                // Rotating the element, depending on the browser:
                var rotate = "rotate("+angle+"deg)";

                if( element.css( "MozTransform" ) != undefined ){//Firefox
                    element.css( "MozTransform", rotate );

                }else if( element.css( "WebkitTransform" ) != undefined ){//Chrome, Safari, Opera 15+
                    element.css( "WebkitTransform", rotate );

                // A version for internet explorer using filters, works but is a bit buggy (no surprise here):
                }else if( element.css( "transform" ) != undefined ){//IE9+
                    element.css( "transform", rotate );

                }else if( element.css( "-ms-filter" ) != undefined ) { //IE8
                    var cos = Math.cos(Math.PI * 2 / 360 * angle);
                    var sin = Math.sin(Math.PI * 2 / 360 * angle);

                    element.css( "-ms-filter", "progid:DXImageTransform.Microsoft.Matrix(M11=" + cos 
                                + ",M12=-" + sin + ",M21=" + sin + ",M22=" + cos 
                                + ",SizingMethod='auto expand',FilterType='nearest neighbor')" );

                    element.css( "left",-Math.floor( ( element.width() - 150 ) / 2 ) );
                    element.css( "top",-Math.floor( ( element.height() - 150 ) / 2 ) );		          

                }else if( element.css( "filter" ) != undefined ){ //IE6 and IE7

                    var cos = Math.cos(Math.PI * 2 / 360 * angle);
                    var sin = Math.sin(Math.PI * 2 / 360 * angle);

                    element.css( "filter", "progid:DXImageTransform.Microsoft.Matrix(M11=" + cos 
                                + ",M12=-" + sin + ",M21=" + sin + ",M22=" + cos 
                                + ",SizingMethod='auto expand',FilterType='nearest neighbor')" );

                    element.css( "left", - Math.floor( ( element.width() - 150 ) / 2 ) );
                    element.css( "top", - Math.floor( ( element.height() - 150 ) / 2 ) );
                }
	
	        },
            callbacks :{
                finish :  function ( settings, element ) {                         
                         return  settings.onFinish.call( element );  
                },
                start :  function ( settings, element, current ) {                         
                         return  settings.onStart.call( element, current, settings.duration, settings.direction  );  
                },
                stop :  function ( settings, element, current ) {                         
                         return  settings.onStop.call( element, current, settings.duration, settings.direction  );  
                }
            },
            polyfill:{
                bind : function(){
                    if (!Function.prototype.bind) {
                        Function.prototype.bind = function(oThis) {
                            if (typeof this !== 'function') {
                                // closest thing possible to the ECMAScript 5
                                // internal IsCallable function
                                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                            }

                            var aArgs   = Array.prototype.slice.call(arguments, 1),
                                fToBind = this,
                                fNOP    = function() {},
                                fBound  = function() {
                                return fToBind.apply(this instanceof fNOP
                                     ? this
                                     : oThis,
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
                                };

                            fNOP.prototype = this.prototype;
                            fBound.prototype = new fNOP();

                            return fBound;
                        };
                   }
                }
            }
        }
        
        // Avoid Plugin.prototype conflicts
		$.extend( Plugin.prototype, {
				init : function () {
						// Place initialization logic here
						// You already have access to the DOM element and
						// the options via the instance, e.g. this.element
						// and this.settings
						// you can add more functions like the one below and
						// call them like so: this.yourOtherFunction(this.element, this.settings).
                        _.polyfill.bind();
						_.render( this.settings, this.element );
                        if( this.settings.autoRun === true ){
                            this.start();
                        }
				},
				start : function () {
                     
                    // Setting up a interval, executed every 1000 milliseconds:
                   if( !_.status ){
                                           
                       //determines if one starts from the right or left
                       var validate = function(){

                            if(  _.cache.current <= this.settings.duration - 1 &&  this.settings.direction === "forward" ){   

                               // animationForward( _.itemsImage, _.cache.current, settings.duration );      

                            }else  if(   _.cache.current >= 0 &&  this.settings.direction === "backward" ){
                                _.animationBackward( _.itemsImage, _.cache.current, this.settings.duration )

                            }else{
                               //stop timer
                               this.stop();
                                _.callbacks.finish( this.settings, this.element );                                
                            }

                        }
                       
                        var intevalTimer = setInterval( validate.bind(this), 1000 );

                        _.intervalTimer = intevalTimer;
                        _.status = true;
                        _.callbacks.start( this.settings, this.element, _.cache.current );   
                   }                   
                  
				},
                stop : function(){
                    if(  _.status ){
                        clearInterval( _.intervalTimer );
                        _.status = false;
                         _.callbacks.stop( this.settings, this.element, _.cache.current ); 
                    }                    
                },
                destroy : function(){
                    this.stop();
                    $( this.element ).removeData( this._name );
                    $( this.element ).html( "" );
                },
               /*restart : function(){
                    _.cache.current = this.settings.start;                 
                    
                },*/
                isRunning : function(){
                     return _.status;
                },
                currentValue : _.cache.current
		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this,   pluginName ) ) {
								$.data( this, pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );