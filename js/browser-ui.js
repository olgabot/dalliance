/* -*- mode: javascript; c-basic-offset: 4; indent-tabs-mode: nil -*- */

// 
// Dalliance Genome Explorer
// (c) Thomas Down 2006-2013
//
// browser-us.js: standard UI wiring (needs refactoring!)
//

window.addEventListener('load', function() {

  b.addFeatureListener(function(ev, hit) {
    b.featurePopup(ev, hit, null);
  });

  b.addFeatureHoverListener(function(ev, hit) {
     // console.log('hover: ' + miniJSONify(hit));
  });

  function formatLongInt(n) {
    return (n|0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  b.addViewListener(function(chr, min, max, zoom) {
      document.getElementById('locfield').value = ('chr' + chr + ':' + formatLongInt(min) + '..' + formatLongInt(max));
      zoomSlider.value = zoom;
  });

  b.addRegionSelectListener(function(chr, min, max) {
      // console.log('chr' + chr + ':' + min + '..' + max);
      // b.highlightRegion(chr, min, max);
      // console.log('selected ' + b.featuresInRegion(chr, min, max).length);
  });

  b.addTierListener(function() {
    console.log('tiers have changed');
  });



    var addTrackBtn = document.getElementById('add-track-button');
    addTrackBtn.addEventListener('click', function(ev) {
      b.showTrackAdder(ev);
    }, false);
    b.makeTooltip(addTrackBtn, 'Add a track!');

    var zoomInBtn = document.getElementById('zoom-in');
    zoomInBtn.addEventListener('click', function(ev) {
      ev.stopPropagation(); ev.preventDefault();

      b.zoomStep(-10);
    }, false);
    b.makeTooltip(zoomInBtn, 'Zoom in');

    var regionField = document.getElementById('locfield');

    var zoomOutBtn = document.getElementById('zoom-out');
    zoomOutBtn.addEventListener('click', function(ev) {
      ev.stopPropagation(); ev.preventDefault();

      b.zoomStep(10);
    }, false);
    b.makeTooltip(zoomOutBtn, 'Zoom out');

    var zoomSlider = document.getElementById('zoom-slider');
    zoomSlider.addEventListener('change', function(ev) {
	b.zoomSliderValue = (1.0 * zoomSlider.value);
	b.zoom(Math.exp((1.0 * zoomSlider.value) / b.zoomExpt));
    }, false);
    zoomSlider.min = b.zoomMin;
    zoomSlider.max = b.zoomMax;

    var favBtn = document.getElementById('favourites-button');
    b.makeTooltip(favBtn, 'Favourite regions');

    var svgBtn = document.getElementById('export-svg-button');
    svgBtn.addEventListener('click', function(ev) {
       ev.stopPropagation(); ev.preventDefault();
  
        var saveDoc = document.implementation.createDocument(NS_SVG, 'svg', null);
        saveDoc.documentElement.setAttribute('width', 800);
        saveDoc.documentElement.setAttribute('height', 800);

        var saveRoot = makeElementNS(NS_SVG, 'g', null, {
            fontFamily: 'helvetica'
        });
        saveDoc.documentElement.appendChild(saveRoot);
        var dallianceAnchor = makeElementNS(NS_SVG, 'text', 'Graphics from Dalliance ' + VERSION, {
                x: 80,
                y: 30,
                strokeWidth: 0,
                fill: 'black',
                fontSize: '12pt'
        });
        saveRoot.appendChild(dallianceAnchor);

        var pos = 50;
        for (var ti = 0; ti < b.tiers.length; ++ti) {
            var tier = b.tiers[ti];
            if (!tier.subtiers) {
                continue;
            }
        
            for (var sti = 0; sti < tier.subtiers.length; ++sti) {
                var subtier = tier.subtiers[sti];
                
                var glyphElements = [];
                for (var gi = 0; gi < subtier.glyphs.length; ++gi) {
                    var glyph = subtier.glyphs[gi];
                    glyphElements.push(glyph.toSVG());
                }
                saveRoot.appendChild(makeElementNS(NS_SVG, 'g', glyphElements, {transform: 'translate(0, ' + pos + ')'}));
                pos += subtier.height + 20;
            }
        }

        var svgBlob = new Blob([new XMLSerializer().serializeToString(saveDoc)]);
        var fr = new FileReader();
        fr.onload = function(fre) {
           // console.log(fre.target.result.substring(6));
           window.open('data:image/svg+xml;' + fre.target.result.substring(6), 'Dalliance graphics');
        };
        fr.readAsDataURL(svgBlob);
        // window.location.href=svgURL;
    }, false);
    b.makeTooltip(svgBtn, 'Export publication-quality SVG');
  }, false);