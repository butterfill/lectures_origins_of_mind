/*!
Deck JS - deck.slide-cone
an extension to allow cloning slides.

Use like this (jade syntax), where the data-which attribute specifies a selector:
section.slide
  .slide-clone(data-which='#dyuia')
  p Other stuff can be appended (or prefixed)

Each .slide-clone will only do one clone using the current state of the slide to be cloned.
  
Copyright (c) 2013 Steve Butterfill
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
The deck.core module provides all the basic functionality for creating and
moving through a deck.  It does so by applying classes to indicate the state of
the deck and its slides, allowing CSS to take care of the visual representation
of each state.  It also provides methods for navigating the deck and inspecting
its state, as well as basic key bindings for going to the next and previous
slides.  More functionality is provided by wholly separate extension modules
that use the API provided by core.
*/
(function($, deck, undefined) {
	
  $('.slide-clone').each(function(i, el) {
    var $el = $(el);
    $el.parents('.slide').first().one('deck.becameCurrent', function(_, direction, from, to) {
      var selector = $el.attr('data-which');
      var $to_clone = $(selector);
      var theClone = $to_clone.clone();
      //remove notes and handouts from the clone (don't want them duplicated)
      $(theClone).find('.notes').remove();
      $(theClone).find('.handout').remove();
      //clear out any old content and put the clone into the .slide-clone element
      $el.html(theClone.html());
    });
  });

})(jQuery, 'deck');
