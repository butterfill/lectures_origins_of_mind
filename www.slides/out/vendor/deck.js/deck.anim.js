/**
 * modified by steve butterfill
 * modifications include
 *  - anim-connect for jsPlumb
 *  - data-scope for addclass etc --- allows you to change stuff other than on the current slide (used to recall slides)
 *  - don't use things like anim-fade, anim-collapse --- these are better as css 
 */
(function($, deck, undefined) {
    // This next line is the color plugin from jquery
    (function(d){d.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(f,e){d.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[Math.max(Math.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)].join(",")+")"}});function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[d.trim(f).toLowerCase()]}function c(g,e){var f;do{f=d.curCSS(g,e);if(f!=""&&f!="transparent"||d.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]}})(jQuery);

    var $d = $(document);
    var may = function(o,f) {return f ? f.bind(o) : function() {}};

    $.extend(true, $[deck].defaults, {
        selectors: {
            animShow: ".anim-show",
            animHide: ".anim-hide",
			//* added
			animCollapse : ".anim-collapse",
			//* added
			animFade : ".anim-fade",
			//* added
			animConnect: ".anim-connect",
			//* added
			animRun: ".anim-run",
            animAddClass: ".anim-addclass",
            animRemoveClass: ".anim-removeclass",
            animAttribute: ".anim-attribute",
            // specific ones
            animPlay: ".anim-play",
            animPause: ".anim-pause",
            animViewboxAs: ".anim-viewboxas",
            //
            animContinue: ".anim-continue"
        },
        anim: {
            duration: 400
        }
    });

    var waitFor = 0
    $[deck]('extend', 'animWaitMore', function(){ waitFor++ });
    $[deck]('extend', 'animWaitLess', function(){ waitFor-- });

    var doInitIfReady = function hoho() {
        if (waitFor>0) {
            setTimeout(doInitIfReady, 10) // retry until all is loaded
            return;
        }
        // first we define some tools and grab some info from deck.js
        var o = $[deck]('getOptions');
        var context = function(el) {
            return {
                what: function() {return $(el).attr("data-what")},
				// *added
                from: function() {return $(el).attr("data-from")},
                fromAnchor: function() {return $(el).attr("data-from-anchor") || "RightMiddle"},
                to: function() {return $(el).attr("data-to")},
                toAnchor: function() {return $(el).attr("data-to-anchor") || "RightMiddle"},
                color: function() {return $(el).attr("data-color") || "rgba(255,255,0,1)"},
                lineWidth: function() {return $(el).attr("data-width") || "3"},
                dur: function() {return $(el).attr("data-dur")*1 || o.anim.duration},
                classs: function() {return $(el).attr("data-class")},
                attribute: function() {return $(el).attr("data-attr").split(':')[0]},
                as: function() {return $(el).attr("data-as")},
                value: function() {return $(el).attr("data-attr").split(':')[1]},
				// modified by steve --- allow the scope for the selector to be specified (useful for reveal)
                toplevel: function() {return ( $(el).attr("data-scope") ? $(el).attr("data-scope") : $[deck]('getToplevelSlideOf', el).node )},
                all: function() {return $(this.what(),this.toplevel())},
				allGlobal: function() {return $(this.what())} 
            }
        };
        var classical = function(selector, methods) {
            $(selector).each(function(i, el) {
                var c = context(el);
                may(methods, methods.create)(c);
                $(el).bind('deck.toplevelBecameCurrent', function(_, direction) {
                    may(methods, methods.init)(c);
                }).bind('deck.afterToplevelBecameCurrent', function(_, direction) {
                    may(methods, methods.fast)(c);
                }).bind('deck.lostCurrent', function(_, direction, from, to) {
                    if (direction == 'forward' || Math.abs(from - to)>1 ) return; // if a big step, let the "step" extension do its job
                    may(methods, methods.undo)(c);
                }).bind('deck.becameCurrent', function(_, direction, from, to) {
                    if (direction == 'reverse' || Math.abs(from - to)>1 ) return; // if a big step, let the "step" extension do its job
                    may(methods, methods.doit)(c);
                });
            });
        };
        
        // here come the real animations
        classical(o.selectors.animShow, {
            init: function(c) {c.all().animate({'opacity': 0.}, 0)},
            undo: function(c) {c.all().animate({'opacity': 0.}, c.dur()/100)},
            doit: function(c) {c.all().animate({'opacity': 1.}, c.dur())},
            fast: function(c) {c.all().animate({'opacity': 1.}, 0)}
        });
		//* added
        classical(o.selectors.animCollapse, {
            init: function(c) {c.all().show(0)},
            undo: function(c) {c.all().show(c.dur()/100)},
            doit: function(c) {c.all().hide(c.dur())},
            fast: function(c) {c.all().hide(0)}
        });
		//* added
        classical(o.selectors.animFade, {
            init: function(c) {c.all().animate({'opacity': 1.}, 0)},
            undo: function(c) {c.all().animate({'opacity': 1.}, c.dur()/100)},
            doit: function(c) {c.all().animate({'opacity': 0.3}, c.dur())},
            fast: function(c) {c.all().animate({'opacity': 0.3}, 0)}
        });
		//* added
        classical(o.selectors.animConnect, {
            init: function(c) {},
            undo: function(c) {
				jsPlumb.detachAllConnections($(c.from()));
			},
            doit: function(c) {
				$.deck('disableScale');
				var tmp = jsPlumb.Defaults.PaintStyle.strokeStyle;
				jsPlumb.Defaults.PaintStyle.strokeStyle = c.color();
				jsPlumb.connect({
				  source : $(c.from()),
				  target : $(c.to()),
				  anchors : [c.fromAnchor(),c.toAnchor()],
				  container: c.toplevel()
				});
				jsPlumb.Defaults.PaintStyle.strokeStyle = tmp;
				$.deck('enableScale')
			},
            fast: function(c) {
				$.deck('disableScale');
				var tmp = jsPlumb.Defaults.PaintStyle.strokeStyle;
				jsPlumb.Defaults.PaintStyle.strokeStyle = c.color();
				jsPlumb.connect({
				  source : $(c.from()),
				  target : $(c.to()),
				  anchors : [c.fromAnchor(),c.toAnchor()],
				  container: c.toplevel()
				});
				jsPlumb.Defaults.PaintStyle.strokeStyle = tmp;
				$.deck('enableScale')
			}
        });
		//* added
        classical(o.selectors.animRun, {
            init: function(c) {scripts[c.what()]['init']()},
            undo: function(c) {scripts[c.what()]['undo']()},
            doit: function(c) {scripts[c.what()]['doit']()},
            fast: function(c) {scripts[c.what()]['fast']()}
        });
        classical(o.selectors.animHide, {
            init: function(c) {c.all().animate({'opacity': 1.}, 0)},
            undo: function(c) {c.all().animate({'opacity': 1.}, c.dur()/100)},
            doit: function(c) {c.all().animate({'opacity': 0.}, c.dur())},
            fast: function(c) {c.all().animate({'opacity': 0.}, 0)}
        });
        classical(o.selectors.animAddClass, {
            init: function(c) {c.all().removeClass(c.classs())},
            undo: function(c) {c.all().removeClass(c.classs())},
            doit: function(c) {c.all().addClass(c.classs())},
            fast: function(c) {c.all().addClass(c.classs())}
        });
        classical(o.selectors.animRemoveClass, {
            init: function(c) {
                var to_rm = c.classs();
                if(to_rm && to_rm.indexOf && to_rm.indexOf('*') != -1) {
                    c.all().each(function(idx){
                        var to_add = $(this).attr('data-cls-rmd');
                        if( to_add ) {
                            $(this).addClass(to_add);
                            $(this).removeAttr('data-cls-rmd')
                        }
                    });
                } else {
                    c.all().addClass(c.classs())
                }
            },
            undo: function(c) {
                var to_rm = c.classs();
                if(to_rm && to_rm.indexOf && to_rm.indexOf('*') != -1) {
                    c.all().each(function(idx){
                        var to_add = $(this).attr('data-cls-rmd');
                        if( to_add ) {
                            $(this).addClass(to_add);
                            $(this).removeAttr('data-cls-rmd')
                        }
                    });
                } else {
                    c.all().addClass(c.classs())
                }
            },
            doit: function(c) {
                var to_rm = c.classs();
                if(to_rm && to_rm.indexOf && to_rm.indexOf('*') != -1) {
                    //class contains wildcards, convert to regex
                    var to_rm_re = new RegExp('\\b' + to_rm.replace(/\*/g,'\\S+').replace(/\s+/g,'|\\b'), 'g');
                    var cls_rmd;
                    c.all().removeClass(function(idx,cls){
                        cls_rmd = (cls.match(to_rm_re)||[]).join(' ');
                        $(this).attr('data-cls-rmd',cls_rmd);
                        return cls_rmd;
                    });
                } else {
                    c.all().removeClass(c.classs());
                }
            },
            fast: function(c) {
                var to_rm = c.classs();
                if(to_rm && to_rm.indexOf && to_rm.indexOf('*') != -1) {
                    //class contains wildcards, convert to regex
                    var to_rm_re = new RegExp('\\b' + to_rm.replace(/\*/g,'\\S+').replace(/\s+/g,'|\\b'), 'g');
                    var cls_rmd;
                    c.all().removeClass(function(idx,cls){
                        cls_rmd = (cls.match(to_rm_re)||[]).join(' ');
                        $(this).attr('data-cls-rmd',cls_rmd);
                        return cls_rmd;
                    });
                } else {
                    c.all().removeClass(c.classs());
                }
            }
        });
		// modified by steve so doesn't animate but simply adds or removes elements
        classical(o.selectors.animAttribute, {
            init: function(c) {
                c.previousElement = [];
                //steve: removed this 2013-10-15 because it screws up expanding an image by clipping
                //c.all().css(c.attribute(), '') // for the jquery anim to work the css attribute should not be defined in the element (in the html) so we suppose it is empty by default (and thus, if it is not empty, it means it has been set by jquery)
            },
            undo: function(c) {
                var key = c.attribute()
                for (i in c.previousElement) { // use the saved list of elements and values
                    var whatTo = {};
                    whatTo[key] = c.previousCss[i];
                    $(c.previousElement[i]).css(whatTo);
                }
            },
            doit: function(c, factor) {
                var key = c.attribute();
                c.previousCss = [];
                c.previousElement = [];
                c.all().each( function(){c.previousElement.push(this); c.previousCss.push($(this).css(key))}) // save a list of elements and values
                var whatTo = {}
                whatTo[key] = c.value()
                c.all().css(whatTo)
            },
            fast: function(c) {this.doit(c,0)}
        });
        classical(o.selectors.animPlay, {
            init: function(c) {c.all().each(function(){this.pause(); try{this.currentTime=0}catch(e){} })},
            undo: function(c) {c.all().each(function(){this.pause()})},
            doit: function(c) {c.all().each(function(){this.play()})},
            fast: function(c) {c.all().each(function(){this.play()})}
        });
        classical(o.selectors.animPause, {
            undo: function(c) {c.all().each(function(){this.play()})},
            doit: function(c) {c.all().each(function(){this.pause()})},
            fast: function(c) {c.all().each(function(){this.pause()})}
        });
        classical(o.selectors.animViewboxAs, {
            create: function(c) {c.whatFrom = {}},
            init: function(c) {this.undo(c)},
            undo: function(c) {c.all().animate(c.whatFrom, 0)},
            doit: function(c, factor) {
                if (factor === undefined) factor = 1
                var attr = "svgViewBox";
                var whatTo = {};
                var asWhat = $(c.as());
                var a = function (i) {return asWhat.attr(i)}
                // todo should do as with the generic attribute above (maintain a list)
                c.whatFrom[attr] = c.all().first().get(0).attributes.getNamedItem('viewBox').nodeValue // custom access to the svg viewbox attribute
                var toViewBox = a('x')+" "+a('y')+" "+a('width')+" "+a('height');
                whatTo[attr] = toViewBox;
                c.all().animate(whatTo, c.dur()*factor)
            },
            fast: function(c) {this.doit(c, 0)}
        });
        classical(o.selectors.animContinue, {
            doit: function(c) {setTimeout(function(){$[deck]('next')}, 1)}
            // do not do it in fast mode
        });
        // handle the chained undo for "anim-continue"
        $(o.selectors.animContinue).each(function(i, curSlide) {
            $(curSlide).bind('deck.becameCurrent', function(_, direction) {
                if (direction == 'forward') return;
                setTimeout(function(){$[deck]('prev')}, 1)
            });

        });

        // finally force "refresh" (notification of slide change)
        var current = $[deck]('getSlide')
        var icur = 0
        for (; icur < $[deck]('getSlides').length; icur++) {
            if ($[deck]('getSlides')[icur] == current) break;                
        }
	$d.trigger("deck.change", [icur, 0]);
	$d.trigger("deck.change", [0, icur]);

    }
    $(document).bind('deck.init', function() {
        setTimeout(doInitIfReady, 10) // try the first time after init
    });
        
})(jQuery, 'deck');

