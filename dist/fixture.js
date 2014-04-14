/*!
Fixture - v1.1.0 - 2014-04-13
https://github.com/kflorence/fixture
A simple, lightweight JavaScript fixture API.

Copyright (C) 2014 Kyle Florence
Released under the BSD, MIT licenses
*/

(function( root, factory ) {

  // AMD
  if ( typeof define === "function" && define.amd ) {
    define( factory );

  // Browser
  } else {
    root.Fixture = factory();
  }

})(this, function() {

var
  fixtures = {},
  uuid = 0;

function clone( source ) {
  var
    key,
    cloned = {};

  for ( key in source ) {
    cloned[ key ] = source[ key ];
  }

  return cloned;
}

function extend( source, target ) {
  var
    key;

  target = target || {};

  for ( key in target ) {
    source[ key ] = target[ key ];
  }

  return source;
}

function noop() {}

function typeOf( value ) {
  return value == null ? value + "" : typeof value;
}

function Fixture( settings ) {

  // Allow calling without the "new" operator
  if ( !Fixture.isFixture( this ) ) {
    return new Fixture( settings );
  }

  // Properties
  this.data = {};
  this.uuid = uuid++;

  extend( this, settings );
}

extend( Fixture.prototype, {
  attach: noop,
  detach: noop,
  equals: function( other ) {
    return Fixture.isFixture( other ) && this.uuid === other.uuid;
  },
  interact: noop,
  toString: function() {
    return "Fixture:" + this.uuid;
  },
  verify: noop
});

extend( Fixture, {
  create: function( value ) {
    var
      fixture;

    value = this.normalize( value );

    if ( value ) {
      fixture = new Fixture( value );
    }

    return fixture;
  },

  define: function( definition ) {
    definition = this.normalize( definition );

    if (
      typeOf( definition ) !== "object" ||
      typeOf( definition.name ) !== "string" ||
      !(
        typeOf( definition.attach ) === "function" ||
        typeOf( definition.detach ) === "function" ||
        typeOf( definition.interact ) === "function" ||
        typeOf( definition.verify ) === "function"
      )
    ) {
      throw "Fixture definition is invalid.";

    } else if ( fixtures[ definition.name ] !== undefined ) {
      throw "Fixture definition name already exists: " + definition.name;
    }

    fixtures[ definition.name ] = definition;
  },

  equal: function( first, second ) {
    return this.isFixture( first ) && first.equals( second );
  },

  get: function( name, settings ) {
    var
      definition;

    if ( typeOf( name ) !== "string" ) {
      return;
    }

    // Allow namespacing
    name = name.split( "." )[ 0 ];
    definition = fixtures[ name ];

    if ( definition ) {
      definition = extend( clone( definition ), this.normalize( settings ) );
    }

    return definition;
  },

  isFixture: (function() {
    var
      matches,
      rFunctionName = /function ([^(]+)/;

    return function( value ) {
      return typeOf( value ) === "object" && value.constructor &&
        ( matches = rFunctionName.exec( value.constructor.toString() ) ) &&
        matches[ 1 ] && matches[ 1 ].toLowerCase() === "fixture";
    };
  })(),

  list: function() {
    var
      name,
      list = [];

    for ( name in fixtures ) {
      list.push( name );
    }

    return list;
  },

  normalize: function( value ) {
    var
      normalized,
      type = typeOf( value );

    if ( type === "string" ) {
      normalized = this.get( value );

    } else if ( type === "function" ) {
      normalized = { interact: value };

    } else if ( type === "object" ) {
      normalized = this.get( value.name, value ) || value;

    } else if ( this.isFixture( value ) ) {
      normalized = value;
    }

    return normalized;
  }
});

  return Fixture;
});