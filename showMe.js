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
  _self.next = document.getElementById('SNext');
  _self.prev = document.getElementById('SPrev');
  _self.pause = document.getElementById('SPause');
  _self.Controls = document.getElementById('Controls');
  _self.openControls = document.querySelector('.sm-open');
  _self.closeControls = document.querySelector('.sm-close');

  _self.frameSize = {
    width: _self.Frame.offsetWidth,
    height: _self.Frame.offsetHeight
  };

  _self.closeControls.addEventListener('click', function(evt) {
    evt.preventDefault();
    _self.Controls.classList.toggle('s__active');
  });
  _self.openControls.addEventListener('click', function(evt) {
    evt.preventDefault();
    _self.Controls.classList.toggle('s__active');
  });

  _self.pause.addEventListener('click', function() {
    var inner = _self.pause.innerText.toLowerCase();

    if ( inner === 'pause' ) {
      clearTimeout(_self.timer);
      _self.pause.innerText = 'play';
    } else {
      _self.pause.innerText = 'pause';
      _self.timer = _self.stepSize();
    }
  }, false);

  _self.update.addEventListener('click', function() {
    _self.updateUrl();
  }, false );

  _self.setupUrl();

  // Calculate Scale
  _self.resize();
  _self.sizes = _self.getSizes();
  _self.sizePointer = 0;

  _self.Select = _self.getSizesAsSelect();
  _self.Details.appendChild(_self.Select);

  _self.Select.addEventListener('change', function(evt) {
    var si = evt.target.value.split(',');
    _self.setSize(si[0], si[1]);
  }, false);

  _self.stepSize();
  
  return this;
};

ShowMe.prototype.stepSize = function() {
  var _self = this;

  var s = _self.sizes[_self.sizePointer];

  console.log('Step size:', s);
  if (s) {
    _self.setSize( s.dimensions[0], s.dimensions[1] );
    console.log('New Size:', document.getElementById(s.id) );

    // Select latest item
    document.getElementById(s.id).setAttribute('selected',true);
  }

  if (_self.sizePointer < _self.sizes.length ) {
    _self.sizePointer++;
    _self.timer = setTimeout(function() {
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

  if (window.location.hash.length > 2) {
    return window.location.hash.replace('#', '');
  } 

  return this.Url.value;
};

ShowMe.prototype.setupUrl = function() {
  var localUrl = window.localStorage.getItem('BCMHShowMeUrl');
  this.iFrame.src = localUrl || this.getUrl();

  if (localUrl)
    this.Url.value = localUrl;
};

ShowMe.prototype.updateUrl = function() {
  this.iFrame.src = this.getUrl();
  window.localStorage.setItem('BCMHShowMeUrl', this.getUrl() );
};

ShowMe.prototype.getSizes = function() {
  var sizes = document.getElementById('Sizes').innerHTML;
  var parts = sizes.split('|'),
      obj = [];

  for (var i = 0; i < parts.length; i++) {
    var s = parts[i].split('x');
    obj.push({
      'id'          : this.getID(s),
      'dimensions'  : s
    });
  }

  return obj;
};

ShowMe.prototype.setSize = function(w, h) {
  this.Frame.style.width = w + 'px';
  this.Frame.style.height = h + 'px';

  this.resize(w, h);
};

ShowMe.prototype.getSizesAsSelect = function() {
  var select = document.createElement('select'),
    inner = '',
    sizes = this.getSizes(),
    counter = 1;

  console.log('Sizes:', sizes );

  for (var i = 0; i < sizes.length; i++) {
    var s = sizes[i];
    console.log(s);
    
    inner += '<option id="' + s.id  + '" value="' + s.dimensions[0] + ',' + s.dimensions[1] + '">' + (i + 1) + '. ' + s.dimensions[0] + '&times' + s.dimensions[1] + 'px / ' + this.getPercentage(this.getScalar( {width: s.dimensions[0], height: s.dimensions[1]} )) + '%' + '</option>';
  }

  select.innerHTML = inner;

  return select;
};

/**
 *
 * 
 * @param  Array size
 * @return String
 */
ShowMe.prototype.getID = function(size) {
  return 's' + size[0] + 'x' + size[1];
};

/**
 * 
 * 
 * @param  Array targetSize [description]
 * @return {[type]}            [description]
 */
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

ShowMe.prototype.getPercentage = function(scalar) {
  return scalar === 1 ? 100 : (scalar * 100).toPrecision(2);
};

var s = new ShowMe();