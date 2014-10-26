/*! Leaflet.Geodesic  https://github.com/henrythasler/Leaflet.Geodesic*/
void 0===Number.prototype.toRadians&&(Number.prototype.toRadians=function(){return this*Math.PI/180}),void 0===Number.prototype.toDegrees&&(Number.prototype.toDegrees=function(){return 180*this/Math.PI})
var INTERSECT_LNG=179.999
L.Geodesic=L.MultiPolyline.extend({options:{color:"blue",steps:10,dash:1,wrap:!0},initialize:function(t,a){this.options=this._merge_options(this.options,a),this.datum={},this.datum.ellipsoid={a:6378137,b:6356752.3142,f:1/298.257223563},L.MultiPolyline.prototype.initialize.call(this,t,this.options)},setLatLngs:function(t){this._latlngs=this.options.dash<1?this._generate_GeodesicDashed(t):this._generate_Geodesic(t),L.MultiPolyline.prototype.setLatLngs.call(this,this._latlngs)},getStats:function(){var t,a,n={distance:0,points:0,polygons:this._latlngs.length}
for(t=0;t<this._latlngs.length;t++)for(n.points+=this._latlngs[t].length,a=0;a<this._latlngs[t].length-1;a++)n.distance+=this._vincenty_inverse(this._latlngs[t][a],this._latlngs[t][a+1]).distance
return n},createCircle:function(t,a){var n,i=[],s=0,e={lat:0,lng:0,brg:0}
for(i[s]=[],n=0;n<=this.options.steps;){var h=this._vincenty_direct(L.latLng(t),360/this.options.steps*n,a,!0),l=L.latLng(h.lat,h.lng)
if(Math.abs(l.lng-e.lng)>180){var o=this._vincenty_inverse(e,l),r=this._intersection(e,o.initialBearing,{lat:-89,lng:l.lng-e.lng>0?-INTERSECT_LNG:INTERSECT_LNG},0)
r?(i[s].push(L.latLng(r.lat,r.lng)),s++,i[s]=[],e=L.latLng(r.lat,-r.lng),i[s].push(e)):(s++,i[s]=[],i[s].push(l),e=l,n++)}else i[s].push(l),e=l,n++}this._latlngs=i,L.MultiPolyline.prototype.setLatLngs.call(this,this._latlngs)},_generate_Geodesic:function(t){var a,n,i,s=[],e=0
for(n=0;n<t.length;n++){for(s[e]=[],i=0;i<t[n].length-1;i++){var h=this._vincenty_inverse(L.latLng(t[n][i]),L.latLng(t[n][i+1])),l=L.latLng(t[n][i])
for(s[e].push(l),a=1;a<=this.options.steps;){var o=this._vincenty_direct(L.latLng(t[n][i]),h.initialBearing,h.distance/this.options.steps*a,this.options.wrap),r=L.latLng(o.lat,o.lng)
if(Math.abs(r.lng-l.lng)>180){var g=this._intersection(L.latLng(t[n][i]),h.initialBearing,{lat:-89,lng:r.lng-l.lng>0?-INTERSECT_LNG:INTERSECT_LNG},0)
g?(s[e].push(L.latLng(g.lat,g.lng)),e++,s[e]=[],l=L.latLng(g.lat,-g.lng),s[e].push(l)):(e++,s[e]=[],s[e].push(r),l=r,a++)}else s[e].push(r),l=r,a++}}e++}return s},_generate_GeodesicDashed:function(t){var a,n,i,s=[],e=0
for(n=0;n<t.length;n++){for(s[e]=[],i=0;i<t[n].length-1;i++){var h=this._vincenty_inverse(L.latLng(t[n][i]),L.latLng(t[n][i+1])),l=L.latLng(t[n][i])
for(s[e].push(l),a=1;a<=this.options.steps;){var o=this._vincenty_direct(L.latLng(t[n][i]),h.initialBearing,h.distance/this.options.steps*a-h.distance/this.options.steps*(1-this.options.dash),this.options.wrap),r=L.latLng(o.lat,o.lng)
if(Math.abs(r.lng-l.lng)>180){var g=this._intersection(L.latLng(t[n][i]),h.initialBearing,{lat:-89,lng:r.lng-l.lng>0?-INTERSECT_LNG:INTERSECT_LNG},0)
g?(s[e].push(L.latLng(g.lat,g.lng)),e++,s[e]=[],l=L.latLng(g.lat,-g.lng),s[e].push(l)):(e++,s[e]=[],s[e].push(r),l=r,a++)}else{s[e].push(r),e++
var M=this._vincenty_direct(L.latLng(t[n][i]),h.initialBearing,h.distance/this.options.steps*a,this.options.wrap)
s[e]=[],s[e].push(L.latLng(M.lat,M.lng)),a++}}}e++}return s},_vincenty_direct:function(t,a,n,i){var s,e=t.lat.toRadians(),h=t.lng.toRadians(),l=a.toRadians(),o=n,r=this.datum.ellipsoid.a,g=this.datum.ellipsoid.b,M=this.datum.ellipsoid.f,c=Math.sin(l),p=Math.cos(l),u=(1-M)*Math.tan(e),L=1/Math.sqrt(1+u*u),d=u*L,v=Math.atan2(u,p),_=L*c,f=1-_*_,y=f*(r*r-g*g)/(g*g),I=1+y/16384*(4096+y*(-768+y*(320-175*y))),N=y/1024*(256+y*(-128+y*(74-47*y))),R=o/(g*I),P=0
do{var m=Math.cos(2*v+R),b=Math.sin(R),E=Math.cos(R),T=N*b*(m+N/4*(E*(-1+2*m*m)-N/6*m*(-3+4*b*b)*(-3+4*m*m)))
s=R,R=o/(g*I)+T}while(Math.abs(R-s)>1e-12&&++P)
var G=d*b-L*E*p,D=Math.atan2(d*E+L*b*p,(1-M)*Math.sqrt(_*_+G*G)),B=Math.atan2(b*c,L*E-d*b*p),C=M/16*f*(4+M*(4-3*f)),S=B-(1-C)*M*_*(R+C*b*(m+C*E*(-1+2*m*m)))
if(i)var w=(h+S+3*Math.PI)%(2*Math.PI)-Math.PI
else var w=h+S
var q=Math.atan2(_,-G)
return{lat:D.toDegrees(),lng:w.toDegrees(),finalBearing:q.toDegrees()}},_vincenty_inverse:function(t,a){var n,i=t.lat.toRadians(),s=t.lng.toRadians(),e=a.lat.toRadians(),h=a.lng.toRadians(),l=this.datum.ellipsoid.a,o=this.datum.ellipsoid.b,r=this.datum.ellipsoid.f,g=h-s,M=(1-r)*Math.tan(i),c=1/Math.sqrt(1+M*M),p=M*c,u=(1-r)*Math.tan(e),L=1/Math.sqrt(1+u*u),d=u*L,v=g,_=0
do{var f=Math.sin(v),y=Math.cos(v),I=L*f*L*f+(c*d-p*L*y)*(c*d-p*L*y),N=Math.sqrt(I)
if(0==N)return 0
var R=p*d+c*L*y,P=Math.atan2(N,R),m=c*L*f/N,b=1-m*m,E=R-2*p*d/b
isNaN(E)&&(E=0)
var T=r/16*b*(4+r*(4-3*b))
n=v,v=g+(1-T)*r*m*(P+T*N*(E+T*R*(-1+2*E*E)))}while(Math.abs(v-n)>1e-12&&++_<100)
if(_>=100)return console.log("Formula failed to converge. Altering target position."),this._vincenty_inverse(t,{lat:a.lat,lng:a.lng-.01})
var G=b*(l*l-o*o)/(o*o),D=1+G/16384*(4096+G*(-768+G*(320-175*G))),B=G/1024*(256+G*(-128+G*(74-47*G))),C=B*N*(E+B/4*(R*(-1+2*E*E)-B/6*E*(-3+4*N*N)*(-3+4*E*E))),S=o*D*(P-C),w=Math.atan2(L*f,c*d-p*L*y),q=Math.atan2(c*f,-p*L+c*d*y)
return S=+S.toFixed(3),{distance:S,initialBearing:w.toDegrees(),finalBearing:q.toDegrees()}},_intersection:function(t,a,n,i){var s=t.lat.toRadians(),e=t.lng.toRadians(),h=n.lat.toRadians(),l=n.lng.toRadians(),o=(+a).toRadians(),r=(+i).toRadians(),g=h-s,M=l-e,c=2*Math.asin(Math.sqrt(Math.sin(g/2)*Math.sin(g/2)+Math.cos(s)*Math.cos(h)*Math.sin(M/2)*Math.sin(M/2)))
if(0==c)return null
var p=Math.acos((Math.sin(h)-Math.sin(s)*Math.cos(c))/(Math.sin(c)*Math.cos(s)))
isNaN(p)&&(p=0)
var u=Math.acos((Math.sin(s)-Math.sin(h)*Math.cos(c))/(Math.sin(c)*Math.cos(h)))
if(Math.sin(l-e)>0)var L=p,d=2*Math.PI-u
else var L=2*Math.PI-p,d=u
var v=(o-L+Math.PI)%(2*Math.PI)-Math.PI,_=(d-r+Math.PI)%(2*Math.PI)-Math.PI
if(0==Math.sin(v)&&0==Math.sin(_))return null
if(Math.sin(v)*Math.sin(_)<0)return null
var f=Math.acos(-Math.cos(v)*Math.cos(_)+Math.sin(v)*Math.sin(_)*Math.cos(c)),y=Math.atan2(Math.sin(c)*Math.sin(v)*Math.sin(_),Math.cos(_)+Math.cos(v)*Math.cos(f)),I=Math.asin(Math.sin(s)*Math.cos(y)+Math.cos(s)*Math.sin(y)*Math.cos(o)),N=Math.atan2(Math.sin(o)*Math.sin(y)*Math.cos(s),Math.cos(y)-Math.sin(s)*Math.sin(I)),R=e+N
return R=(R+3*Math.PI)%(2*Math.PI)-Math.PI,{lat:I.toDegrees(),lng:R.toDegrees()}},_merge_options:function(t,a){var n={}
for(var i in t)n[i]=t[i]
for(var i in a)n[i]=a[i]
return n}}),L.geodesic=function(t,a){return new L.Geodesic(t,a)}