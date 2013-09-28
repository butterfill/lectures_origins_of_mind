/*!
Deck JS - deck.notes
Copyright (c) 2011 Remi BARRAQUAND
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt

MODIFIED by STEVE 2013
*/

/*
This module adds the methods and key binding to show and hide speaker notes.

Create a section for the notes before the .deck-container thus (jade syntax):
	.deck-notes
	  .deck-notes-container

Using the shift modifier produces a page of notes for export.

Also create a section for the handout export before the .deck-container thus (jade syntax):
	.deck-handout
	  .deck-handout-container

Using the 'h' key produces a handout export page.

To better use this module consider the "deck.clone.js" module which allows to 
clone a deck presentation and displays into a popup window. That way you can
only toggle the notes panel for this cloned window.
*/
(function($, deck, undefined) {
    var $d = $(document);
    var $notesContainer;
    
    /*
	Extends defaults/options.
	
        options.classes.notes
		This class is added to the deck container when showing the slide
                notes.
	
	options.keys.notes
		The numeric keycode used to toggle between showing and hiding 
                the slide notes.
	*/
    $.extend(true, $[deck].defaults, {
        classes: {
            notes: 'deck-notes',
			handout: 'deck-handout',
            notesContainer: 'deck-notes-container',
			handoutContainer: 'deck-handout-container'
        },
		
        keys: {
            notes: 78, // n
			handout: 72 //h
        },
                
        selectors: {
            // no selector
        }
    });

    /*
	jQuery.deck('showNotes')
	
	Shows the slide notes by adding the class specified by the toc class option
	to the deck container.
	*/
    $[deck]('extend', 'showNotes', function() {
        $("."+$[deck]('getOptions').classes.notes).show();
		$('.deck-container').css({left:150});
    });
    
    $[deck]('extend', 'showNotesExport', function() {
        $notesEl = $("."+$[deck]('getOptions').classes.notes);
		$notesEl.show();
		$notesEl.addClass('notes-export');
		//show all notes
		$('.notes', $notesEl).show();
		$('.divider, .notes-header', $notesEl).show();
		//hide the slides completely
		$('.deck-container').hide();
    });

    $[deck]('extend', 'showHandoutExport', function() {
        $handoutEl = $("."+$[deck]('getOptions').classes.handout);
		$handoutEl.show();
		//hide the slides completely
		$('.deck-container').hide();
    });

    /*
	jQuery.deck('hideNotes')
	
	Hides the slide notes by removing the class specified by the toc class
	option from the deck container.
	*/
    $[deck]('extend', 'hideNotes', function() {
        $("."+$[deck]('getOptions').classes.notes).hide();
		$('.deck-container').css({left:0});
    });

    $[deck]('extend', 'hideNotesExport', function() {
        $notesEl = $("."+$[deck]('getOptions').classes.notes);
		$notesEl.hide();
		$notesEl.removeClass('notes-export');
		$('.deck-container').show();
    });

    $[deck]('extend', 'hideHandoutExport', function() {
        $handoutEl = $("."+$[deck]('getOptions').classes.handout);
		$handoutEl.hide();
		$('.deck-container').show();
    });
    /*
	jQuery.deck('toggleNotes')
	
	Toggles between showing and hiding the notes.
	*/
    $[deck]('extend', 'toggleNotes', function() {
        $("."+$[deck]('getOptions').classes.notes).is(":visible") ? $[deck]('hideNotes') : $[deck]('showNotes');
    });

	$[deck]('extend', 'toggleNotesExport', function() {
        $("."+$[deck]('getOptions').classes.notes).hasClass("notes-export") ? $[deck]('hideNotesExport') : $[deck]('showNotesExport');
    });

	$[deck]('extend', 'toggleHandoutExport', function() {
        $("."+$[deck]('getOptions').classes.handout).is(":visible") ? $[deck]('hideHandoutExport') : $[deck]('showHandoutExport');
    });


    /*
        jQuery.deck('Init')
        */
    $d.bind('deck.init', function() {
        var opts = $[deck]('getOptions');
        var container = $[deck]('getContainer');
        
        /* Bind key events */
        $d.unbind('keydown.decknotes').bind('keydown.decknotes', function(e) {
            if (e.which === opts.keys.notes || $.inArray(e.which, opts.keys.notes) > -1) {
				if (e.shiftKey) {
					$[deck]('toggleNotesExport');
				} else {
					$[deck]('toggleNotes');
				}
                e.preventDefault();
            }
            if (e.which === opts.keys.handout || $.inArray(e.which, opts.keys.handout) > -1) {
				$[deck]('toggleHandoutExport');
                e.preventDefault();
            }
        });
		/* copy the notes into the special notes element */
		var $notesContainer = $("."+$[deck]('getOptions').classes.notesContainer);
		var $notes = $('.deck-container .notes');
		var slide_id,
			last_slide_id = -1;
		$notes.each( function(idx, note){
			var $note = $(note);

			// usual case -- note belongs to slide which is its parent
			var $slide = $note.parents('.slide').first();

			//but occasionally we want to assign note to a prior sibling (because of the way we use anim and mixins)
			previous = $note.siblings().splice(0,$note.index());
			$previous_slide = $(previous).filter('.slide').last();
			if( $previous_slide.length > 0 ) {
				$slide = $previous_slide;
			}

			slide_id = $slide.attr('id');
			if( last_slide_id != -1 && last_slide_id != slide_id ) {
				$notesContainer.append('<div class="divider for-'+last_slide_id+'">--------</div>')
			}
			if( last_slide_id != slide_id ) {
				$notesContainer.append('<div class="notes-header for-'+slide_id+'">Notes for '+slide_id+':</div>');
			}
			$notesContainer.append('<div class="notes for-'+slide_id+'">'+$note.html()+'</div>');
			last_slide_id = slide_id;
		});

		
		/* copy the handout elements into the special handout element */
		var $handoutContainer = $("."+$[deck]('getOptions').classes.handoutContainer);

		// the not('.handout .handout') clause ensures we don't add things twice when .handout is nested in .handout
		// (such nesting can be useful for showing and hiding things)
		// the not('img') clause is because we want to do images differently
		var $handouts = $('.deck-container .handout').not('.handout .handout');
		var img_path ='../slides/src/files';
		$handouts.each( function(idx, handout){
			var $handout = $(handout);
			//is it an image?
			if( $handout.not('img').length > 0 ) {
				//it's not an image
				$handoutContainer.append('<div class="handout">'+$handout.html()+'</div>');
				// add in a blank line (for latex paragraph) unless .ctd is present
				if( !$handouts.eq(idx+1).hasClass('ctd') ) {
					$handoutContainer.append("<div>&nbsp;</div>");
				}
			} else {
				//it's an image
				//var $caption = $handout.next('.caption');
				//var caption_txt = $caption.length ? $caption.html() : '';
				var file = $handout.attr('src');
				$.each(['\\begin{center}',
						'\\includegraphics[scale=0.3]{'+img_path+file+'}',
						// '\\caption{'+caption_txt+'}',
						'\\end{center}',
						], function(idx,txt){
					$handoutContainer.append("<div>"+txt+"</div>");
				});
			}
		});
		
		
    })
    .bind('deck.change', function(e, from, to) {
        var slideTo = $[deck]('getSlide', to);
		var $notesContainer = $("."+$[deck]('getOptions').classes.notesContainer);
		$('.notes', $notesContainer).hide();
		$('.divider, .notes-header', $notesContainer).hide();
		var slide_id = $(slideTo).attr('id');
		var $notes = $('.for-'+slide_id, $notesContainer);
		$notes.show();
    });
})(jQuery, 'deck');