/* globals console, document, FileReader, clearTimeout, setTimeout, window */
'use strict';

var ShowMe = function() {

  var _self = this;

  // Settings
  _self.padding = 16;
  _self.speed = 5000;

  // Selectors
  _self.Frame = document.getElementById('Frame');
  _self.Details = document.getElementById('Details');
  _self.Progress = document.querySelector('#Details progress');
  _self.Url = document.getElementById('Url');
  _self.iFrame = document.getElementById('iFrame');
  _self.update = document.getElementById('UpdateUrl');
  _self.next = document.getElementById('SNext');
  _self.prev = document.getElementById('SPrev');
  _self.pause = document.getElementById('SPause');
  _self.Controls = document.getElementById('Controls');

  _self.state = {
    pause : false
  };

  _self.frameSize = {
    width: _self.Frame.offsetWidth,
    height: _self.Frame.offsetHeight
  };

  _self.pause.addEventListener('click', function() {
    var inner = _self.pause.innerText.toLowerCase();

    if ( _self.state.pause === false ) {
      _self.state.pause = true;
      _self.pause.innerText = 'play';

      clearTimeout(_self.timer);
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

  _self.Progress.setAttribute('style', 'animation-duration:' + _self.speed + 'ms' );

  _self.Select.addEventListener('change', function(evt) {
    var si = evt.target.value.split(',');
    _self.setSize(si[0], si[1]);
  }, false);

  _self.Url.addEventListener('keyup',function(evt) {
    if (evt.code === 'Enter') {
      _self.updateUrl();
    }
  }, false );

  _self.stepSize();

  return this;
};

ShowMe.prototype.stepSize = function() {
  var _self = this;

  var s = _self.sizes[_self.sizePointer];

  if (s) {
    _self.setSize( s.dimensions[0], s.dimensions[1] );
    // Select latest item
    document.getElementById(s.id).setAttribute('selected',true);
  }

  _self.Progress.classList.toggle('s__invert');

  if (_self.sizePointer < _self.sizes.length ) {
    _self.sizePointer++;
    _self.timer = setTimeout(function() {
      _self.stepSize();
    }, _self.speed );
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
  var localUrl = window.localStorage.getItem('BCMH_ShowMeUrl');
  this.iFrame.src = localUrl || this.getUrl();

  if (localUrl)
    this.Url.value = localUrl;
};

ShowMe.prototype.updateUrl = function() {
  this.iFrame.src = this.getUrl();
  window.localStorage.setItem('BCMH_ShowMeUrl', this.getUrl() );
};



ShowMe.prototype.getFromStore = function() {
  var defaultItems = [
    "768x1024",
    "1920x1080",
    "1440x900",
    "375x667",
    "1280x800",
    "1366x768",
    "320x568",
    "2560x1440",
    "360x640",
    "1680x1050",
    "1920x1200",
    "1280x1024",
    "1600x900",
    "414x736",
    "1024x768",
    "1280x720",
    "320x480",
    "1536x864",
    "2048x1152",
    "1600x1200",
    "1024x1366",
    "412x732",
    "800x600",
    "1360x768",
    "854x1366",
    "1600x20000",
    "600x960",
    "800x1280",
    "480x800",
    "320x534",
    "720x1280",
    "360x592",
    "960x600",
    "1301x731",
    "1440x960",
    "2560x1600",
    "1438x808",
    "1518x853",
    "600x1024",
    "1093x614",
    "1242x698",
    "2133x1200",
    "1024x819",
    "1344x840",
    "3440x1440",
    "601x962",
    "1829x1029",
    "2560x1080",
    "1024x600",
    "1280x768",
    "640x360",
    "962x601",
    "1600x1000",
    "1706x960",
    "320x570",
    "1280x752",
    "1371x771",
    "1280x960",
    "1536x960",
    "640x480",
    "1080x1920",
    "1152x720",
    "1422x800",
    "1670x939",
    "1707x960",
    "230x285",
    "403x716",
    "1152x864",
    "1188x668",
    "1455x818",
    "2021x1137",
    "2259x1271",
    "3200x1800",
    "480x854",
    "505x505"
  ];

  // If stored in localStorage
  //
  // var sizes = window.localStorage.getItem('BCMH_ShowMeSizes') || document.getElementById('Sizes').innerHTML;
  //     sizes = sizes.split('\n').filter(function(r) { return r });

  return defaultItems;
};

/**
 *
 *
 * @return array of objects {id, dimensions}
 */
ShowMe.prototype.getSizes = function() {
  var parts = this.getFromStore(),
      arr = [];

  if (parts.length) {
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i].split('x');
      arr.push({
        'id'          : this.getID(s),
        'dimensions'  : s
      });
    }
  }

  // Default sizes
  if (arr.length === 0 ) {
    arr.push({
      id : 'default',
      dimensions : [screen.width, screen.height]
    });
  }
  return arr;
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
  console.log(sizes);

  for (var i = 0; i < sizes.length; i++) {
    var s = sizes[i],
        size = {
          width  : s.dimensions[0],
          height : s.dimensions[1]
        };

    inner += '<option id="' + s.id  + '" value="' + s.dimensions.toString() + '">' + (i + 1) + '. ' + s.dimensions[0] + '&times' + s.dimensions[1] + 'px / scaled ' + this.getPercentage( this.getScalar( size ) ) + '</option>';
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
      scaleY = (window.innerHeight - this.padding * 5 ) / targetSize.height,
      scalar = this.min( scaleX, scaleY );

  if (scalar >= 1 ) {
    scalar = 1;
  }

  this.scalar = scalar;
  return scalar;
};

ShowMe.prototype.getPercentage = function(scalar) {
  return (scalar === 1 ? 100 : (scalar * 100).toPrecision(2)) + '%';
};

function handleDragEnter(evt) {
  evt.target.classList.add('s__hover');
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}

function handleFileDrop(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    if (file.type === 'text/csv') {
      dropZone.innerHTML = '<p>' + file.name + '</p>';
      readCSV(file);
      console.log('New CSV Loaded:', 'Reload');
    }
  }
}

function readCSV(file) {
  var fr = new FileReader();

  fr.onload = (function(theFile) {
    return function(e) {
      var sizes = parseAnalyticsCSV(e.target.result);
      window.SMCSV = e.target.result;

        // Updating dom
        console.log('New Sizes loaded:', sizes );
        window.localStorage.setItem('BCMH_ShowMeSizes', sizes.join('\n'));
    };
  })(file);

  fr.readAsText(file);
}

function parseAnalyticsCSV( csvString ) {

  if (!csvString.match('Screen Resolution')) {
    return false;
  }

  var arr = csvString.split('\n').filter(function(r) {
    return r.match(',') && r.match(/[0-9]+x[0-9]+/);
  }).map(function(r) {
    return r.split(',').shift();
  });

  return arr;
}

var dropZone = document.getElementById('FileUploader');

dropZone.addEventListener('dragover', handleDragOver, false );
document.body.addEventListener('dragover', handleDragEnter, false );

dropZone.addEventListener('drop', handleFileDrop, false);

var s = new ShowMe();