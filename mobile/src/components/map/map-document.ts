import { leafletCSS, leafletScript } from "./leaflet-bundle";
import { MAP_CHANNEL, MapData, serializeForScript } from "./map-protocol";

/** Only the map runs in HTML. Leaflet is bundled so map controls work without a JS CDN. */
export function createMapDocument(
  token: string,
  initial: MapData,
  parentOrigin?: string,
): string {
  const config = serializeForScript({
    token,
    channel: MAP_CHANNEL,
    initial,
    parentOrigin,
  });
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src https://tile.openstreetmap.org data:; connect-src 'none'; base-uri 'none'; form-action 'none'"><style>${leafletCSS}
html,body,#map{width:100%;height:100%;margin:0;overflow:hidden;background:#0b2839}html{font-family:Arial,sans-serif}.leaflet-container{background:#0b2839}.leaflet-tile-pane{filter:invert(1) hue-rotate(185deg) brightness(.72) contrast(1.05) saturate(.45)}.leaflet-control-attribution{background:rgba(7,28,43,.88)!important;color:#c7d8e2!important;font-size:10px!important;padding:4px 7px!important}.leaflet-control-attribution a{color:#c7d8e2!important}.pin{display:flex;align-items:center;justify-content:center;width:32px;height:32px;box-sizing:border-box;border-radius:50%;background:white;border:2px solid #ff6f61;color:#ff6f61;font:700 13px/1 Arial,sans-serif;box-shadow:0 4px 12px #0008}.pin.active{background:#ff6f61;color:#fff;width:36px;height:36px;box-shadow:0 0 0 8px #ff6f6138,0 0 25px #ff6f6160}.label{position:absolute;bottom:47px;left:50%;transform:translateX(-50%);max-width:175px;padding:6px 11px;background:#16425c;border:1px solid #ffffff25;border-radius:12px;color:white;font:700 10px/1.4 Arial,sans-serif;letter-spacing:.09em;text-transform:uppercase;white-space:nowrap;box-shadow:0 5px 16px #0007}.leaflet-marker-icon:focus{outline:3px solid #fff;outline-offset:5px;border-radius:50%}.leaflet-control{clear:none}.pin{transition:background-color .16s ease,color .16s ease,box-shadow .16s ease}.label{animation:placeLabelIn .18s ease-out both}@keyframes placeLabelIn{from{opacity:0;transform:translate(-50%,4px)}to{opacity:1;transform:translate(-50%,0)}}html[data-reduced-motion="true"] *{animation:none!important;transition:none!important}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style></head><body><div id="map" role="application" aria-label="Interactive map of Zanzibar and Tanzania destinations"></div><script>${leafletScript}</script><script>
(function(){'use strict';
var config=${config};
var data=config.initial, markers={}, markerSelection={}, tileTimer, disposed=false, userInteracted=false, errors=0, successes=0;
function post(message){var payload=JSON.stringify(Object.assign({channel:config.channel,token:config.token},message));if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(payload)}else if(window.parent!==window){window.parent.postMessage(payload,config.parentOrigin||'*')}}
function status(value){post({type:'status',status:value})}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function icon(pin,selected){return L.divIcon({className:'',iconSize:[selected?36:32,selected?36:32],iconAnchor:[selected?18:16,selected?18:16],html:(selected?'<span class="label">'+escapeHTML(pin.name)+'</span>':'')+'<span class="pin'+(selected?' active':'')+'">'+pin.number+'</span>'})}
var map=L.map('map',{zoomControl:false,attributionControl:true,minZoom:3,maxZoom:17,worldCopyJump:false,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false,inertia:!data.reducedMotion}).setView([-6.15,39.3],9);
var motionQuery=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
function applyMotion(){var reduced=data.reducedMotion!==false||!!(motionQuery&&motionQuery.matches);document.documentElement.setAttribute('data-reduced-motion',String(reduced));map.options.inertia=!reduced;if(reduced)map.stop()}
if(motionQuery&&motionQuery.addEventListener)motionQuery.addEventListener('change',applyMotion);
map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
var tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,noWrap:true,keepBuffer:2,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
tiles.on('loading',function(){errors=0;successes=0;clearTimeout(tileTimer);tileTimer=setTimeout(function(){if(!successes)status('error')},15000)});
tiles.on('tileload',function(){successes++;status('ready')});
tiles.on('tileerror',function(){errors++});
tiles.on('load',function(){clearTimeout(tileTimer);if(errors&&successes===0)status('error');else status('ready')});
tiles.addTo(map);
function fit(){if(!data.pins.length)return;map.fitBounds(L.latLngBounds(data.pins.map(function(p){return [p.lat,p.lng]})),{paddingTopLeft:[42,58],paddingBottomRight:[55,45],maxZoom:11,animate:false})}
function paint(){var next={};data.pins.forEach(function(pin){next[pin.id]=true;var selected=pin.id===data.selectedId;var marker=markers[pin.id];if(!marker){marker=L.marker([pin.lat,pin.lng],{icon:icon(pin,selected),title:pin.name,alt:pin.name,keyboard:true});marker.on('click',function(){post({type:'select',id:pin.id})});marker.addTo(map);markers[pin.id]=marker}else if(markerSelection[pin.id]!==selected){marker.setIcon(icon(pin,selected))}markerSelection[pin.id]=selected;marker.setZIndexOffset(selected?1000:0)});Object.keys(markers).forEach(function(id){if(!next[id]){map.removeLayer(markers[id]);delete markers[id];delete markerSelection[id]}})}
function receive(command){if(!command||typeof command!=='object')return;if(command.type==='ping'){post({type:'ready'});status(successes>0?'ready':'loading')}else if(command.type==='zoom'&&(command.delta===1||command.delta===-1)){userInteracted=true;map.setZoom(Math.max(3,Math.min(17,map.getZoom()+command.delta)),{animate:false})}else if(command.type==='fit'){fit()}else if(command.type==='update'&&command.data&&Array.isArray(command.data.pins)){var next=command.data;if(typeof next.reducedMotion!=='boolean')return;if(!next.pins.every(function(p){return p&&typeof p.id==='string'&&typeof p.name==='string'&&Number.isInteger(p.number)&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&Math.abs(p.lat)<=90&&Math.abs(p.lng)<=180}))return;var refit=next.fitKey!==data.fitKey;data=next;applyMotion();paint();if(refit){userInteracted=false;fit()}}}
window.dpMap={receive:receive};
window.addEventListener('message',function(event){if(event.source!==window.parent||(config.parentOrigin&&event.origin!==config.parentOrigin))return;try{var msg=typeof event.data==='string'?JSON.parse(event.data):event.data;if(msg.channel===config.channel&&msg.token===config.token)receive(msg.command)}catch(e){}});
document.addEventListener('click',function(event){var link=event.target.closest&&event.target.closest('a');if(link){event.preventDefault();post({type:'link',url:link.href})}});
document.addEventListener('pointerdown',function(){userInteracted=true});document.addEventListener('wheel',function(){userInteracted=true},{passive:true});
function resize(){if(!disposed){map.invalidateSize({pan:false,animate:false});if(!userInteracted)fit()}}
if(window.ResizeObserver){new ResizeObserver(resize).observe(document.getElementById('map'))}window.addEventListener('resize',resize);window.addEventListener('beforeunload',function(){disposed=true;clearTimeout(tileTimer);if(motionQuery&&motionQuery.removeEventListener)motionQuery.removeEventListener('change',applyMotion);map.remove()});
applyMotion();paint();fit();resize();post({type:'ready'});if(!successes)status('loading');
})();</script></body></html>`;
}
