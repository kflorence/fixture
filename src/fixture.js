var
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

function typeOf( thing ) {
  return thing == null ? thing + "" : typeof thing;
}

function Fixture( settings ) {

  // Allow calling without the "new" operator
  if ( !Fixture.isFixture( this ) ) {
    return new Fixture( settings );
  }

  // Properties
  this.data = {};
  this.options = {};
  this.uuid = uuid++;

  extend( this, settings );
}

extend( Fixture.prototype, {
  attach: noop,
  detach: noop,
  equals: function( fixture ) {
    return Fixture.isFixture( fixture ) && this.uuid === fixture.uuid;
  },
  toString: function() {
    return "Fixture:" + this.uuid;
  },
  use: noop
});

extend( Fixture, {
  create: function( mixed ) {
    var
      fixture;

    mixed = this.normalize( mixed );

    if ( mixed ) {
      fixture = new Fixture( mixed );
    }

    return fixture;
  },

  define: function( proto ) {
    if (
      typeOf( proto ) !== "object" ||
      typeOf( proto.name ) !== "string" ||
      !(
        typeOf( proto.attach ) === "function" ||
        typeOf( proto.detach ) === "function" ||
        typeOf( proto.use ) === "function"
      )
    ) {
      throw "Invalid Fixture prototype.";
    }

    this.prototypes[ proto.name ] = proto;
  },

  equals: function( first, second ) {
    return this.isFixture( first ) && first.equals( second );
  },

  get: function( name, settings ) {
    var
      proto;

    if ( typeOf( name ) !== "string" ) {
      return;
    }

    // Allow namespacing
    name = name.split( "." )[ 0 ];
    proto = this.prototypes[ name ];

    if ( proto ) {
      proto = extend( clone( proto ), settings );
    }

    return proto;
  },

  prototypes: {},

  isFixture: (function() {
    var
      matches,
      rFunctionName = /function ([^(]+)/;

    return function( object ) {
      return typeOf( object ) === "object" && object.constructor &&
        ( matches = rFunctionName.exec( object.constructor.toString() ) ) &&
        matches[ 1 ] && matches[ 1 ].toLowerCase() === "fixture";
    };
  })(),

  normalize: function( mixed ) {
    var
      fixture,
      type = typeOf( mixed );

    if ( type === "string" ) {
      fixture = this.get( mixed );

    } else if ( type === "function" ) {
      fixture = { use: mixed };

    } else if ( type === "object" ) {
      fixture = this.get( mixed.name, mixed ) || mixed;

    } else if ( this.isFixture( mixed ) ) {
      fixture = mixed;
    }

    return fixture;
  }
});