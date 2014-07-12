L.Geodesic = L.MultiPolyline.extend({
    options: {
	color:'blue'
    },  
  
    initialize: function(latlngs, options) {
      this.options = this._merge_options(this.options, options);
      L.MultiPolygon.prototype.initialize.call(this, latlngs, this.options);    
    },
  
    setLatLngs: function (latlngs) {
      L.MultiPolygon.prototype.setLatLngs.call(this, latlngs);
    },  

  /**
  * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
  * @param obj1
  * @param obj2
  * @returns obj3 a new object based on obj1 and obj2
  */
  _merge_options: function(obj1,obj2){
      var obj3 = {};
      for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
      for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
      return obj3;
  }
});

L.geodesic = function(latlngs, options) {
    return new L.Geodesic(latlngs, options);
};
