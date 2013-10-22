# The DocPad Configuration File
# It is simply a CoffeeScript Object which is parsed by CSON
docpadConfig = {

plugins:
  raw:
    commands:
      # rsync
      # -r recursive
      # -u skip file if the destination file is newer
      # -l copy any links over as well
      raw  : ['rsync', '-rul', 'src/raw/', 'out/' ]


	#renderPasses : 1

	# =================================
	# Template Data
	# These are variables that will be accessible via our templates
	# To access one of these within our templates, refer to the FAQ: https://github.com/bevry/docpad/wiki/FAQ

	templateData:

		moment:
			require('moment')

		# Specify some site properties
		site:
			# The production url of our website
			url: "http://origins-of-mind.butterfill.com"

			# The default title of our website
			title: "Origins of Mind"

			# The website description (for SEO)
			description: """
				Origins of Mind: Lectures.
				"""

			# The website keywords (for SEO) separated by commas
			keywords: """
				philosophy, psychology, development, thought
				"""


		# -----------------------------
		# Helper Functions

		# Get the prepared site/document title
		# Often we would like to specify particular formatting to our page's title
		# we can apply that formatting here
		getPreparedTitle: ->
			# if we have a document title, then we should use that and suffix the site's title onto it
			if @document.title
				"#{@document.title} | #{@site.title}"
			# if our document does not have it's own title, then we should just use the site's title
			else
				@site.title

		# Get the prepared site/document description
		getPreparedDescription: ->
			# if we have a document description, then we should use that, otherwise use the site's description
			@document.description or @site.description

		# Get the prepared site/document keywords
		getPreparedKeywords: ->
			# Merge the document keywords with the site keywords
			@site.keywords.concat(@document.keywords or []).join(', ')
			
	collections:
		lectures: -> @getCollection('documents').findAll({basename:/^(fast)?lecture_/}, [basename:1])
		units: -> @getCollection('documents').findAll({url:/\/units\/unit_/}, [sequence:1])
}

# Export our DocPad Configuration
module.exports = docpadConfig