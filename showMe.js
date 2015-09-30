/* globals console, document */
'use strict';

var ShowMe = function() {
  
  var _self = this;

  // Settings
  _self.padding = 16;

  // Selectors
  _self.Frame = document.getElementById('Frame');
  _self.Details = document.getElementById('Details');
  _self.Url = document.getElementById('Url');
  _self.iFrame = document.getElementById('iFrame');
  _self.update = document.getElementById('UpdateUrl');

  _self.frameSize = {
    width: _self.Frame.offsetWidth,
    height: _self.Frame.offsetHeight
  };

  _self.update.addEventListener('click', function() {
    _self.updateUrl();
  }, false )


  _self.updateUrl();
  // Calculate Scale
  _self.resize();
  _self.sizes = _self.getSizes();
  _self.sizePointer = 0;

  _self.stepSize();
  
  return this;
};

ShowMe.prototype.getPercentage = function(scalar) {
  return scalar === 1 ? 100 : (scalar * 100).toPrecision(2);
};

ShowMe.prototype.stepSize = function() {
  var _self = this;

  var s = _self.sizes[_self.sizePointer];

  if (s) {
    _self.setSize( s[0], s[1] );
    this.Details.innerHTML = (_self.sizePointer + 1) + '. ' + s[0] + '&times' + s[1] + 'px / ' + _self.getPercentage( this.scalar ) + '%';
  }

  if (_self.sizePointer < _self.sizes.length ) {
    _self.sizePointer++;
    setTimeout(function() {
      _self.stepSize();
    }, 4000 );
  }
};

ShowMe.prototype.resize = function(w, h) {
  var _self = this;
  var dimensions = {
    width: w,
    height: h
  };
  
  _self.Frame.style.webkitTransform = 'scale(' + _self.getScalar( dimensions ) + ')';
};

ShowMe.prototype.min = function( a, b ) {
  return a > b ? b : a;
};

ShowMe.prototype.max = function( a, b ) {
  return a < b ? b : a;
};

ShowMe.prototype.map = function(value, istart, istop, ostart, ostop) {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
};

ShowMe.prototype.containDimensions = function ( child_w, child_h, container_w, container_h ) {
  var scale_factor = this.min( container_w / child_w, container_h / child_h );
  return {
    width: child_w * scale_factor,
    height: child_h * scale_factor,
  };
};

ShowMe.prototype.getUrl = function() {
  return this.Url.value;
};

ShowMe.prototype.updateUrl = function() {
  this.iFrame.src = this.getUrl();
};

ShowMe.prototype.getSizes = function() {
  var sizes = document.getElementById('Sizes').innerHTML;
  var parts = sizes.split('|');

  for (var i = 0; i < parts.length; i++) {
    parts[i] = parts[i].split('x');
  }

  return parts;
};

ShowMe.prototype.setSize = function(w, h) {
  this.Frame.style.width = w + 'px';
  this.Frame.style.height = h + 'px';

  this.resize(w, h);
};

ShowMe.prototype.getScalar = function( targetSize ) {
  var scaleX = (window.innerWidth - this.padding * 2 ) / targetSize.width,
      scaleY = (window.innerHeight - this.padding * 2 ) / targetSize.height,
      scalar = this.min( scaleX, scaleY );

  if (scalar >= 1 ) {
    scalar = 1;
  }

  this.scalar = scalar;

  return scalar;
};

var s = new ShowMe();