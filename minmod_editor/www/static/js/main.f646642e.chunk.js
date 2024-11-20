(this["webpackJsonpminmod-editor"]=this["webpackJsonpminmod-editor"]||[]).push([[0],{240:function(e,t,o){},272:function(e,t,o){},281:function(e,t,o){"use strict";o.r(t);var i=o(46),r=o.n(i),n=(o(240),o(41));var a=e=>{e&&e instanceof Function&&o.e(3).then(o.bind(null,318)).then((t=>{let{getCLS:o,getFID:i,getFCP:r,getLCP:n,getTTFB:a}=t;o(e),i(e),r(e),n(e),a(e)}))},s=o(0),c=o.n(s),d=o(312),l=o(9);Object({NODE_ENV:"production",PUBLIC_URL:"/editor",WDS_SOCKET_HOST:void 0,WDS_SOCKET_PATH:void 0,WDS_SOCKET_PORT:void 0,FAST_REFRESH:!0}).REACT_APP_PLATFORM;const u="native"===Object({NODE_ENV:"production",PUBLIC_URL:"/editor",WDS_SOCKET_HOST:void 0,WDS_SOCKET_PATH:void 0,WDS_SOCKET_PORT:void 0,FAST_REFRESH:!0}).REACT_APP_PLATFORM?Object({NODE_ENV:"production",PUBLIC_URL:"/editor",WDS_SOCKET_HOST:void 0,WDS_SOCKET_PATH:void 0,WDS_SOCKET_PORT:void 0,FAST_REFRESH:!0}).REACT_APP_API_SERVER:"",m="/editor";var h=o(307);class p extends n.e{constructor(){super("".concat(u,"/api/v1"),{id:"username"},!1)}async login(e,t){let o=await h.a.post("".concat(u,"/api/v1/login"),{username:e,password:t});return Object(l.r)((()=>{this.set(this.deserialize(o.data))}))}async isLoggedIn(){if(this.records.size>0)return!0;try{let e=await h.a.get("".concat(u,"/api/v1/whoami"));return Object(l.r)((()=>{this.set(this.deserialize(e.data))})),!0}catch(e){return!1}}getCurrentUser(){if(0!==this.records.size)return this.records.values().next().value||void 0}deserialize(e){return{id:e.username,email:e.email,name:e.name,url:"https://minmod.isi.edu/users/".concat(e.username)}}}class v extends n.e{constructor(){super("".concat(u,"/api/v1/commodities"),void 0,!1)}async fetchCriticalCommotities(){(this.refetch||0===this.records.size)&&await this.fetch({});const e=[];for(const t of this.records.values())null!==t&&t.isCritical&&e.push(t);return e}getByName(e){if(0!==this.records.size){for(const t of this.records.values())if(null!==t&&t.name===e)return t;return null}}deserialize(e){return{id:e.uri.substring(e.uri.lastIndexOf("/")+1),uri:e.uri,name:e.name,isCritical:e.is_critical}}normRemoteSuccessfulResponse(e){return{items:e.data,total:e.total}}}class y extends n.e{constructor(){super("".concat(u,"/api/v1/deposit-types"),void 0,!1,[new n.g("name","id"),new n.g("uri","id")])}get name2id(){return this.indices[0]}get uri2id(){return this.indices[1]}getByName(e){let t=this.name2id.index.get(e);return void 0===t?void 0:this.records.get(t)}getByURI(e){let t=this.uri2id.index.get(e);return void 0===t?void 0:this.records.get(t)}async fetchAll(){(this.refetch||0===this.records.size)&&await this.fetch({})}deserialize(e){return{...e,id:e.uri}}normRemoteSuccessfulResponse(e){return{items:e.data,total:e.total}}}class g extends n.e{constructor(){super("".concat(u,"/api/v1/countries"),void 0,!1)}getByURI(e){const t=this.records.get(e);if(null!==t)return t}async fetchAll(){(this.refetch||0===this.records.size)&&await this.fetch({})}deserialize(e){return{id:e.uri,name:e.name}}normRemoteSuccessfulResponse(e){return{items:e.data,total:e.total}}}class f extends n.e{constructor(){super("".concat(u,"/api/v1/states-or-provinces"),void 0,!1)}getByURI(e){const t=this.records.get(e);if(null!==t)return t}async fetchAll(){(this.refetch||0===this.records.size)&&await this.fetch({})}deserialize(e){return{id:e.uri,name:e.name}}normRemoteSuccessfulResponse(e){return{items:e.data,total:e.total}}}class j{constructor(e){let{source:t,confidence:o,observedName:i,normalizedURI:r}=e;this.source=void 0,this.confidence=void 0,this.observedName=void 0,this.normalizedURI=void 0,this.source=t,this.confidence=o,this.observedName=i,this.normalizedURI=r}clone(){return new j({source:this.source,confidence:this.confidence,observedName:this.observedName,normalizedURI:this.normalizedURI})}static deserialize(e){return new j({source:e.source,confidence:e.confidence,observedName:e.observed_name,normalizedURI:e.normalized_uri})}serialize(){return{source:this.source,confidence:this.confidence,observed_name:this.observedName,normalized_uri:this.normalizedURI}}}class b{constructor(e){let{commodity:t,totalTonnage:o,totalGrade:i,totalContainedMetal:r}=e;this.commodity=void 0,this.totalTonnage=void 0,this.totalGrade=void 0,this.totalContainedMetal=void 0,this.commodity=t,this.totalTonnage=o,this.totalGrade=i,this.totalContainedMetal=r}clone(){return new b({commodity:this.commodity,totalTonnage:this.totalTonnage,totalGrade:this.totalGrade,totalContainedMetal:this.totalContainedMetal})}static deserialize(e){return new b({commodity:e.commodity,totalTonnage:e.total_tonnage,totalGrade:e.total_grade,totalContainedMetal:e.total_contained_metal})}}class O{constructor(e){let{document:t,comment:o,property:i}=e;this.document=void 0,this.comment=void 0,this.property=void 0,this.document=t,this.comment=o,this.property=i}clone(){return new O({document:this.document.clone(),comment:this.comment,property:this.property})}static deserialize(e){return e={...e,document:x.deserialize(e.document)},new O(e)}serialize(){return{document:this.document.serialize(),comment:this.comment,property:this.property}}static normalizeProperty(e){switch(e){case"name":return"http://www.w3.org/2000/01/rdf-schema#label";case"location":return"https://minmod.isi.edu/ontology/location";case"depositType":return"https://minmod.isi.edu/ontology/deposit_type";case"grade":return"https://minmod.isi.edu/ontology/grade";case"tonnage":return"https://minmod.isi.edu/ontology/ore";default:return""}}}class x{constructor(e){let{uri:t,title:o}=e;this.uri=void 0,this.title=void 0,this.uri=t,this.title=o}clone(){return new x({uri:this.uri,title:this.title})}static deserialize(e){return new x({uri:e.uri,title:e.title})}serialize(){return{uri:this.uri,title:this.title}}}class T{constructor(e){let{category:t,commodity:o,grade:i,ore:r,reference:n}=e;this.category=void 0,this.commodity=void 0,this.grade=void 0,this.ore=void 0,this.reference=void 0,this.category=t,this.commodity=o,this.grade=i,this.ore=r,this.reference=n}static fromGradeTonnage(e,t,o,i){const r=e.commodityStore.get(o.commodity);return new T({category:["Inferred","Indicated","Measured"].map((e=>new j({source:t,confidence:1,observedName:e,normalizedURI:"https://minmod.isi.edu/resource/"+e}))),commodity:new j({source:t,confidence:1,observedName:r.name,normalizedURI:r.uri}),grade:void 0===o.totalGrade?void 0:new I({value:o.totalGrade,unit:new j({source:t,confidence:1,observedName:"%",normalizedURI:"https://minmod.isi.edu/resource/Q201"})}),ore:void 0===o.totalTonnage?void 0:new I({value:o.totalTonnage,unit:new j({source:t,confidence:1,observedName:"%",normalizedURI:"https://minmod.isi.edu/resource/Q202"})}),reference:i})}static deserialize(e){return new T({category:void 0===e.category?[]:e.category.map(j.deserialize),commodity:j.deserialize(e.commodity),grade:void 0===e.grade?void 0:I.deserialize(e.grade),ore:void 0===e.ore?void 0:I.deserialize(e.ore),reference:O.deserialize(e.reference)})}}class I{constructor(e){let{value:t,unit:o}=e;this.value=void 0,this.unit=void 0,this.value=t,this.unit=o}static deserialize(e){return new I({value:e.value,unit:j.deserialize(e.unit)})}}class w{constructor(e){let{id:t,recordId:o,sourceId:i,createdBy:r,name:n,locationInfo:a,depositTypeCandidate:s,reference:c,sameAs:d,gradeTonnage:l,dedupSiteURI:u,mineralInventory:m}=e;this.id=void 0,this.sourceId=void 0,this.recordId=void 0,this.dedupSiteURI=void 0,this.createdBy=void 0,this.name=void 0,this.locationInfo=void 0,this.depositTypeCandidate=void 0,this.reference=void 0,this.sameAs=void 0,this.gradeTonnage=void 0,this.mineralInventory=void 0,this.id=t,this.recordId=o,this.sourceId=i,this.dedupSiteURI=u,this.createdBy=r,this.name=n,this.locationInfo=a,this.depositTypeCandidate=s,this.reference=c,this.sameAs=d,this.gradeTonnage=l,this.mineralInventory=m}get uri(){return"https://minmod.isi.edu/resource/".concat(this.id)}getReferencedDocuments(){const e={};for(const t of this.reference)e[t.document.uri]=t.document;return e}getFirstReferencedDocument(){return this.reference[0].document}updateField(e,t,o){switch(t.field){case"name":this.name=t.value;break;case"location":this.locationInfo.location=t.value;break;case"depositType":this.depositTypeCandidate=[new j({source:this.createdBy[0],confidence:1,normalizedURI:t.normalizedURI,observedName:t.observedName})];break;case"grade":void 0===this.gradeTonnage[t.commodity]?this.gradeTonnage[t.commodity]=new b({commodity:t.commodity,totalGrade:t.value,totalTonnage:1e-5}):this.gradeTonnage[t.commodity].totalGrade=t.value,this.mineralInventory=[T.fromGradeTonnage(e,this.createdBy[0],this.gradeTonnage[t.commodity],o)];break;case"tonnage":void 0===this.gradeTonnage[t.commodity]?this.gradeTonnage[t.commodity]=new b({commodity:t.commodity,totalTonnage:t.value,totalGrade:1e-5}):this.gradeTonnage[t.commodity].totalTonnage=t.value,this.mineralInventory=[T.fromGradeTonnage(e,this.createdBy[0],this.gradeTonnage[t.commodity],o)];break;default:throw new Error("Unknown edit: ".concat(t))}this.reference.push(o)}}class S extends w{constructor(e){let{draftID:t,...o}=e;super(o),this.draftID=void 0,this.draftID=t}static fromMineralSite(e,t,o,i,r){var n;const a=o[0].id===t.sites[0]?o[0]:o.filter((e=>e.id===t.sites[0]))[0],s="https://minmod.isi.edu/users/".concat(i);return new S({draftID:"draft-".concat(t.id),id:"",sourceId:S.updateSourceId(a.sourceId,i),recordId:a.recordId,dedupSiteURI:t.uri,createdBy:[s],name:t.name,locationInfo:null===(n=t.location||new k({country:[],stateOrProvince:[]}))||void 0===n?void 0:n.toLocationInfo(e,s,1),depositTypeCandidate:t.depositTypes.length>0?[t.getTop1DepositType().toCandidateEntity(e)]:[],reference:[r],sameAs:t.sites,gradeTonnage:{[t.gradeTonnage.commodity]:t.gradeTonnage},mineralInventory:[]})}static updateSourceId(e,t){const[o,i]=e.split("::",2),r=new URL(i);return r.searchParams.set("username",t),"".concat(o,"::").concat(r.toString())}}class R extends w{constructor(){super(...arguments),this.isSaved=!0}updateField(e,t,o){super.updateField(e,t,o),this.isSaved=!1}markSaved(){this.isSaved=!0}toModel(){return new w(this)}}class C{constructor(e){let{country:t,stateOrProvince:o,location:i,crs:r}=e;this.location=void 0,this.country=void 0,this.stateOrProvince=void 0,this.crs=void 0,this.location=i,this.country=t,this.stateOrProvince=o,this.crs=r}static deserialize(e){return new C({location:e.location,country:void 0===e.country?[]:e.country.map(j.deserialize),stateOrProvince:void 0===e.state_or_province?[]:e.state_or_province.map(j.deserialize),crs:void 0===e.crs?void 0:j.deserialize(e.crs)})}clone(){return new C({location:this.location,country:this.country.map((e=>e.clone())),stateOrProvince:this.stateOrProvince.map((e=>e.clone())),crs:this.crs?this.crs.clone():void 0})}}class z extends n.b{constructor(e){super("".concat(u,"/api/v1/mineral-sites"),void 0,!1),this.dedupMineralSiteStore=void 0,this.dedupMineralSiteStore=e}async createAndUpdateDedup(e,t){let o=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];const i=await this.create(t,o);return await this.dedupMineralSiteStore.forceFetchByURI(i.dedupSiteURI,e),i}async updateAndUpdateDedup(e,t){let o=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];const i=await this.update(t,o);return await this.dedupMineralSiteStore.forceFetchByURI(i.dedupSiteURI,e),i}deserialize(e){return new w({id:e.id,recordId:e.record_id,sourceId:e.source_id,dedupSiteURI:e.dedup_site_uri,createdBy:e.created_by,name:e.name,locationInfo:void 0!==e.location_info?C.deserialize(e.location_info):new C({country:[],stateOrProvince:[]}),depositTypeCandidate:(e.deposit_type_candidate||[]).map(j.deserialize),reference:e.reference.map(O.deserialize),sameAs:e.same_as,gradeTonnage:Object.fromEntries(e.grade_tonnage.map((e=>{const t=b.deserialize(e);return[t.commodity,t]}))),mineralInventory:e.mineral_inventory.map(T.deserialize)})}serializeRecord(e){var t;const o=e.reference.map((e=>e.serialize()));let i=[];for(const r of Object.values(e.gradeTonnage))console.log("@@@",r),i.push({category:["Inferred","Indicated","Measured"].map((t=>({source:e.createdBy[0],confidence:1,normalized_uri:"https://minmod.isi.edu/resource/".concat(t)}))),commodity:{source:e.createdBy[0],confidence:1,normalized_uri:"https://minmod.isi.edu/resource/".concat(r.commodity)},ore:{value:r.totalTonnage,unit:{source:e.createdBy[0],confidence:1,normalized_uri:"https://minmod.isi.edu/resource/Q202"}},grade:{value:r.totalGrade,unit:{source:e.createdBy[0],confidence:1,normalized_uri:"https://minmod.isi.edu/resource/Q201"}},reference:o[0]});return{name:e.name,record_id:e.recordId,source_id:e.sourceId,created_by:e.createdBy,dedup_site_uri:e.dedupSiteURI,location_info:{country:e.locationInfo.country.map((e=>e.serialize())),state_or_province:e.locationInfo.stateOrProvince.map((e=>e.serialize())),crs:null===(t=e.locationInfo.crs)||void 0===t?void 0:t.serialize(),location:e.locationInfo.location},deposit_type_candidate:e.depositTypeCandidate.map((e=>e.serialize())),mineral_inventory:i,reference:o,same_as:e.sameAs}}normRemoteSuccessfulResponse(e){return{items:Array.isArray(e.data)?e.data:Object.values(e.data),total:e.total}}}class _{constructor(e){let{uri:t,source:o,confidence:i}=e;this.uri=void 0,this.source=void 0,this.confidence=void 0,this.uri=t,this.source=o,this.confidence=i}toCandidateEntity(e){var t;return new j({source:this.source,confidence:this.confidence,normalizedURI:this.uri,observedName:null===(t=e.depositTypeStore.get(this.uri))||void 0===t?void 0:t.name})}}class k{constructor(e){let{lat:t,lon:o,country:i,stateOrProvince:r}=e;this.lat=void 0,this.lon=void 0,this.country=void 0,this.stateOrProvince=void 0,this.lat=t,this.lon=o,this.country=i,this.stateOrProvince=r}static deserialize(e){return new k({lat:e.lat,lon:e.lon,country:e.country||[],stateOrProvince:e.state_or_province||[]})}toLocationInfo(e,t){let o,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;return void 0!==this.lat&&void 0!==this.lon&&(o="POINT (".concat(this.lon," ").concat(this.lat,")")),new C({location:o,crs:new j({source:t,confidence:i,normalizedURI:"https://minmod.isi.edu/resource/Q701",observedName:"EPSG:4326"}),country:this.country.map((o=>{var r;return new j({source:t,confidence:i,normalizedURI:o,observedName:null===(r=e.countryStore.get(o))||void 0===r?void 0:r.name})})),stateOrProvince:this.stateOrProvince.map((o=>{var r;return new j({source:t,confidence:i,normalizedURI:o,observedName:null===(r=e.stateOrProvinceStore.get(o))||void 0===r?void 0:r.name})}))})}}class U{constructor(e){let{id:t,uri:o,name:i,type:r,rank:n,sites:a,depositTypes:s,location:c,gradeTonnage:d}=e;this.id=void 0,this.uri=void 0,this.name=void 0,this.type=void 0,this.rank=void 0,this.sites=void 0,this.depositTypes=void 0,this.location=void 0,this.gradeTonnage=void 0,this.id=t,this.uri=o,this.name=i,this.type=r,this.rank=n,this.sites=a,this.depositTypes=s,this.location=c,this.gradeTonnage=d}get commodity(){return this.gradeTonnage.commodity}static getId(e){return e.substring(e.lastIndexOf("/")+1)}static deserialize(e){return new U({id:e.id,uri:"https://minmod.isi.edu/resource/".concat(e.id),name:e.name,type:e.type,rank:e.rank,sites:e.sites,depositTypes:e.deposit_types.map((e=>new _(e))),location:void 0!==e.location?k.deserialize(e.location):void 0,gradeTonnage:b.deserialize(e.grade_tonnage)})}getTop1DepositType(){return this.depositTypes[0]}}class N extends n.e{constructor(e){super("".concat(u,"/api/v1/dedup-mineral-sites"),void 0,!1,[new n.f("commodity","id")]),this.ns=void 0,this.ns=e,Object(l.o)(this,{forceFetchByURI:l.f})}get commodity2ids(){return this.indices[0]}async forceFetchByURI(e,t){const o=U.getId(e);try{this.state.value="updating";let e=await h.a.get("".concat(this.remoteURL,"/").concat(o),{params:{commodity:t}});return Object(l.r)((()=>{let t=this.deserialize(e.data);return this.records.set(t.id,t),this.index(t),this.state.value="updated",this.records.get(t.id)}))}catch(i){if(i.response&&404===i.response.status)return void Object(l.r)((()=>{this.records.set(o,null),this.state.value="updated"}));throw Object(l.r)((()=>{this.state.value="error"})),i}}async fetchByCommodity(e){return!this.refetch&&this.commodity2ids.index.has(e.id)?this.getByCommodity(e):await this.fetch({conditions:{commodity:e.id}})}getByCommodity(e){if(!this.commodity2ids.index.has(e.id))return{records:[],total:0};const t=[];for(const o of this.commodity2ids.index.get(e.id))t.push(this.records.get(o));return{records:t,total:t.length}}deserialize(e){const t=this.ns.MR;return new U({id:e.id,uri:t.getURI(e.id),name:e.name,type:e.type,rank:e.rank,sites:e.sites,depositTypes:e.deposit_types.map((e=>new _({uri:t.getURI(e.id),source:e.source,confidence:e.confidence}))),location:void 0!==e.location?new k({lat:e.location.lat,lon:e.location.lon,country:(e.location.country||[]).map((e=>t.getURI(e))),stateOrProvince:(e.location.state_or_province||[]).map((e=>t.getURI(e)))}):void 0,gradeTonnage:b.deserialize(e.grade_tonnage)})}normRemoteSuccessfulResponse(e){return{items:e.data,total:e.total}}}class P{constructor(e,t){this.prefix=void 0,this.namespace=void 0,this.prefix=e,this.namespace=t}getURI(e){return"".concat(this.namespace).concat(e)}}const B=new N(new class{constructor(){this.MR=new P("mr","https://minmod.isi.edu/resource/"),this.MO=new P("mo","https://minmod.isi.edu/ontology/"),this.MD=new P("md","https://minmod.isi.edu/ontology-derived/")}}),F={userStore:new p,commodityStore:new v,dedupMineralSiteStore:B,mineralSiteStore:new z(B),depositTypeStore:new y,stateOrProvinceStore:new f,countryStore:new g};Object(n.j)((e=>{d.a.error("Error while talking with the server.",5)})),window._stores=F,window.toJS=l.s;const D=Object(s.createContext)(F);function E(){return c.a.useContext(D)}var A=o(314),L=o(106),M=o(226),G=o(310),V=o(151),K=o(148),q=o.n(K),W=o(110),H=o(10);const Q=e=>{let{searchArgs:t,setSearchArgs:o}=e;const{commodityStore:i}=E(),[r,n]=Object(s.useState)([]);Object(s.useEffect)((()=>{i.fetchCriticalCommotities().then((e=>{n(e.map((e=>({value:e.id,label:e.name}))))}))}),[i]);return Object(H.jsxs)(M.a,{children:[Object(H.jsx)(G.a.Text,{children:"Commodity:"}),Object(H.jsx)(V.a,{style:{width:200},value:t.commodity,placeholder:"Select a commodity",showSearch:!0,optionFilterProp:"label",onChange:e=>{o({commodity:i.get(e).name})},options:r})]})};var J=o(142),X=o(315),Y=o(313),Z=o(68),$=o(306),ee=o(228),te=o(317),oe=o(311);const ie=e=>{let{entity:t}=e;if(void 0===t)return Object(H.jsx)("span",{children:"-"});const o=void 0===t.observedName?" ":t.observedName;return void 0!==t.normalizedURI?Object(H.jsx)(G.a.Link,{href:t.normalizedURI,target:"_blank",children:o}):Object(H.jsx)("span",{children:o})},re=e=>{let{entities:t}=e;const o=[];t.length>0&&o.push(Object(H.jsx)(ie,{entity:t[0]},0));for(let i=1;i<t.length;i++)o.push(Object(H.jsx)("span",{children:"\xa0-\xa0"})),o.push(Object(H.jsx)(ie,{entity:t[i]},i));return Object(H.jsx)(H.Fragment,{children:o})};function ne(e,t){if(0===e.length)return[];const o=[e[0]];for(let i=1;i<e.length;i++)o.push(t(i)),o.push(e[i]);return o}var ae=o(309),se=o(223),ce=o(308),de=o(183),le=o(316),ue=o(187);const me=e=>{const[t,o]=Object(s.useState)(!1),i=e.options.map((t=>({key:t.key,label:t.label,onClick:()=>{o(!0),void 0!==e.onChange&&e.onChange(t.label),e.onProvenanceChange(t.key)}})));return i.push({type:"divider"}),i.push({key:"new",label:"Enter your own",onClick:()=>{o(!0),e.onProvenanceChange(void 0),void 0!==e.onChange&&e.onChange("")}}),t?Object(H.jsx)(se.a,{value:e.value,onChange:t=>void 0!==e.onChange?e.onChange(t.target.value):void 0,placeholder:"Enter your own",suffix:Object(H.jsx)(le.a,{style:{color:"rgba(0,0,0,.25)"},onClick:()=>{o(!1),void 0!==e.onChange&&e.onChange("")}})}):Object(H.jsx)(de.a,{menu:{items:i,style:{marginLeft:-12,marginTop:8}},children:Object(H.jsx)(se.a,{value:e.value,placeholder:"Select an option or enter your own",suffix:Object(H.jsx)(ue.a,{style:{color:"rgba(0,0,0,.25)"}})})})},he=e=>{let{currentSite:t,sites:o,editField:i,commodity:r,onFinish:n}=e;const{depositTypeStore:a}=E(),[c]=ae.a.useForm(),d=Object(s.useMemo)((()=>{switch(i){case"name":return"Name";case"location":return"Location";case"depositType":return"Deposit Type";case"grade":return"Grade (%)";case"tonnage":return"Tonnage (Mt)";default:return""}}),[i]),l=e=>{if(void 0!==e){const t=o.filter((t=>t.id===e))[0];c.setFieldValue("refDocURI",t.getFirstReferencedDocument().uri)}else c.setFieldValue("refDocURI","")};let u=[],m=[],h={fieldValue:"",refDocURI:"",refComment:"",refAppliedToAll:!0};if("name"===i)u=o.map((e=>({key:e.id,label:e.name}))),void 0!==t&&(h.fieldValue=t.name,h.refDocURI=t.getFirstReferencedDocument().uri,h.refComment=t.reference[0].comment);else if("location"===i)u=o.filter((e=>void 0!==e.locationInfo.location)).map((e=>({key:e.id,label:e.locationInfo.location}))),void 0!==t&&(h.fieldValue=t.locationInfo.location||"",h.refDocURI=t.getFirstReferencedDocument().uri,h.refComment=t.reference[0].comment);else if("depositType"===i){m=q.a.uniqBy(o.flatMap((e=>e.depositTypeCandidate)).filter((e=>void 0!==e.normalizedURI)),"normalizedURI").sort(((e,t)=>e.confidence-t.confidence)).map((e=>({value:e.normalizedURI,label:a.getByURI(e.normalizedURI).name})));const e=new Set(m.map((e=>e.value)));m=m.concat(a.filter((t=>!e.has(t.uri))).map((e=>({value:e.uri,label:e.name})))),void 0!==t&&t.depositTypeCandidate.length>0&&(h.fieldValue=t.depositTypeCandidate[0].normalizedURI,h.refDocURI=t.getFirstReferencedDocument().uri,h.refComment=t.reference[0].comment)}const p=q.a.uniqBy(o.flatMap((e=>Object.values(e.getReferencedDocuments()).map((e=>({key:e.uri,label:e.title||e.uri}))))),"uri");let v;return v="grade"===i||"tonnage"===i?Object(H.jsx)(se.a,{type:"number"}):"depositType"===i?Object(H.jsx)(V.a,{showSearch:!0,options:m,optionFilterProp:"label"}):Object(H.jsx)(me,{onProvenanceChange:l,options:u}),Object(H.jsx)(ce.a,{title:"Edit Mineral Site",width:"70%",open:void 0!==i,onCancel:()=>n(),footer:null,children:Object(H.jsxs)(ae.a,{form:c,onFinish:e=>{if(void 0===i)return;const t=c.getFieldsValue();let o;if("name"===i||"location"===i)o={field:i,value:t.fieldValue};else if("depositType"===i)o={field:i,observedName:a.getByURI(t.fieldValue).name,normalizedURI:t.fieldValue};else{if("grade"!==i&&"tonnage"!==i)throw new Error("Unknown field ".concat(i));o={field:i,value:parseFloat(t.fieldValue),commodity:r}}n({edit:o,reference:new O({document:new x({uri:t.refDocURI}),comment:t.refComment,property:t.refAppliedToAll?void 0:O.normalizeProperty(i)})})},layout:"vertical",style:{marginTop:24,marginBottom:24},requiredMark:!0,initialValues:h,children:[Object(H.jsx)(ae.a.Item,{name:"fieldValue",label:d,required:!0,tooltip:"This is a required field",rules:[{required:!0,message:"Value cannot be empty"}],children:v}),Object(H.jsx)(ae.a.Item,{name:"refDocURI",label:"Reference",required:!0,tooltip:"This is a required field",rules:[{required:!0,message:"Document URL"}],children:Object(H.jsx)(me,{onProvenanceChange:()=>{},options:p})}),Object(H.jsx)(ae.a.Item,{name:"refComment",label:"Comment",children:Object(H.jsx)(se.a.TextArea,{rows:3})}),Object(H.jsx)(ae.a.Item,{name:"refAppliedToAll",valuePropName:"checked",children:Object(H.jsx)(J.a,{children:"This reference applies to all fields"})}),Object(H.jsx)(ae.a.Item,{children:Object(H.jsxs)(M.a,{children:[Object(H.jsx)(Z.a,{type:"primary",htmlType:"submit",children:"Save"}),Object(H.jsx)(Z.a,{htmlType:"button",onClick:()=>n(),children:"Cancel"})]})})]})})};var pe=o(52);const ve={table:{"& .ant-table":{margin:"0px !important",border:"1px solid #ccc"}},editButton:{cursor:"pointer"},myEditedRow:{backgroundColor:"".concat(pe.d[1]," !important"),"& > td":{backgroundColor:"".concat(pe.d[1]," !important")}}},ye=Object(oe.a)(ve)(Object(L.a)((e=>{let{dedupSite:t,commodity:o,classes:i}=e;const r=E(),{mineralSiteStore:n,userStore:a}=r,[c,d]=Object(s.useState)(void 0),l=Object(s.useMemo)((()=>[{title:Object(H.jsxs)(A.a,{justify:"space-between",children:[Object(H.jsx)("span",{children:"Name"}),Object(H.jsx)(ee.a,{className:i.editButton,onClick:()=>d("name")})]}),key:"name",render:(e,t)=>Object(H.jsx)(G.a.Link,{href:t.uri,target:"_blank",children:t.name})},{title:Object(H.jsxs)(A.a,{justify:"space-between",children:[Object(H.jsx)("span",{children:"Location"}),Object(H.jsx)(ee.a,{className:i.editButton,onClick:()=>d("location")})]}),key:"location",render:(e,t)=>Object(H.jsx)(G.a.Text,{className:"font-small",ellipsis:!0,style:{maxWidth:200},children:t.locationInfo.location})},{title:"CRS",key:"crs",render:(e,t)=>{var o;return Object(H.jsx)("span",{children:null===(o=t.locationInfo.crs)||void 0===o?void 0:o.observedName})}},{title:"Country",key:"country",render:(e,t)=>Object(H.jsx)(re,{entities:t.locationInfo.country})},{title:"State/Province",key:"state/province",render:(e,t)=>Object(H.jsx)(re,{entities:t.locationInfo.stateOrProvince})},{title:Object(H.jsxs)(A.a,{justify:"space-between",children:[Object(H.jsx)("span",{children:"Dep. Type"}),Object(H.jsx)(ee.a,{className:i.editButton,onClick:()=>d("depositType")})]}),key:"deposit-type",render:(e,t)=>Object(H.jsx)(ie,{entity:t.depositTypeCandidate[0]})},{title:"Dep. Confidence",key:"dep-type-confidence",render:(e,t)=>0===t.depositTypeCandidate.length?"-":t.depositTypeCandidate[0].confidence.toFixed(4)},{title:Object(H.jsxs)(A.a,{justify:"space-between",children:[Object(H.jsx)("span",{children:"Tonnage (Mt)"}),Object(H.jsx)(ee.a,{className:i.editButton,onClick:()=>d("tonnage")})]}),key:"tonnage",render:(e,t)=>{const i=t.gradeTonnage[o.id];return void 0===i||void 0===i.totalTonnage?"-":i.totalTonnage.toFixed(4)}},{title:Object(H.jsxs)(A.a,{justify:"space-between",children:[Object(H.jsx)("span",{children:"Grade (%)"}),Object(H.jsx)(ee.a,{className:i.editButton,onClick:()=>d("grade")})]}),key:"grade",render:(e,t)=>{const i=t.gradeTonnage[o.id];return void 0===i||void 0===i.totalGrade?"-":i.totalGrade.toFixed(2)}},{title:"Reference",key:"reference",render:(e,t)=>Object(H.jsx)(ge,{site:t})}]),[o.id]);Object(s.useEffect)((()=>{n.fetchByIds(t.sites)}),[n]);const u=t.sites.map((e=>n.get(e))).filter((e=>void 0!==e)),m=u.filter((e=>null!==e)),h="updating"===n.state.value||u.length!==t.sites.length,p=m.find((e=>e.createdBy.includes(a.getCurrentUser().url)));return Object(H.jsxs)(H.Fragment,{children:[Object(H.jsx)($.a,{className:i.table,bordered:!0,pagination:!1,size:"small",rowKey:"id",columns:l,dataSource:m,loading:h,rowClassName:e=>e.createdBy.includes(a.getCurrentUser().url)?i.myEditedRow:""}),Object(H.jsx)(he,{sites:m,currentSite:p,editField:c,onFinish:e=>{if(void 0===e)return void d(void 0);const o=a.getCurrentUser(),i=m.find((e=>e.createdBy.includes(o.url)));let s;if(void 0===i){const i=S.fromMineralSite(r,t,m,o.id,e.reference);i.updateField(r,e.edit,e.reference),s=n.createAndUpdateDedup(t.commodity,i)}else{const o=new R(i);o.updateField(r,e.edit,e.reference),s=n.updateAndUpdateDedup(t.commodity,o)}s.then((()=>{d(void 0)}))},commodity:o.id},c)]})}))),ge=e=>{let{site:t}=e;const o=Object(s.useMemo)((()=>Object.values(t.getReferencedDocuments())),[t]);return Object(H.jsx)(G.a.Text,{ellipsis:!0,style:{maxWidth:200},children:ne(o.map((e=>Object(H.jsx)(G.a.Link,{target:"_blank",href:e.uri,children:e.title||e.uri},e.uri))),(e=>Object(H.jsx)("span",{children:"\xa0\xb7\xa0"},"sep-".concat(e))))})},fe=e=>{let{uri:t,store:o}=e;const i=E()[o],r=i.get(t);return null===r?Object(H.jsx)(G.a.Link,{href:t,target:"_blank",children:"Not found"}):void 0===r?(console.log({store:o,db:i,uri:t,record:r}),Object(H.jsx)(G.a.Link,{href:t,target:"_blank",children:"Loading..."})):Object(H.jsx)(G.a.Link,{href:t,target:"_blank",children:r.name})},je={records:[],total:0},be=[{title:"Select",key:"select",render:()=>Object(H.jsx)(J.a,{})},{title:"Name",dataIndex:"name",key:"name",render:(e,t)=>Object(H.jsx)(G.a.Link,{href:t.uri,target:"_blank",children:t.name}),sorter:(e,t)=>e.name.localeCompare(t.name)},{title:"Type",key:"type",render:(e,t)=>Object(H.jsx)("span",{className:"font-small",children:t.type}),sorter:(e,t)=>e.type.localeCompare(t.type)},{title:"Rank",key:"rank",render:(e,t)=>Object(H.jsx)("span",{className:"font-small",children:t.rank}),sorter:(e,t)=>e.rank.localeCompare(t.rank)},{title:"Location",key:"location",render:(e,t)=>void 0!==t.location&&void 0!==t.location.lat&&void 0!==t.location.lon?"".concat(t.location.lat.toFixed(5),", ").concat(t.location.lon.toFixed(5)):"-"},{title:"Country",key:"country",render:(e,t)=>void 0===t.location?"-":Object(H.jsx)(M.a,{split:Object(H.jsx)(X.a,{type:"vertical"}),children:t.location.country.map((e=>Object(H.jsx)(fe,{uri:e,store:"countryStore"},e)))})},{title:"State/Province",key:"state",render:(e,t)=>void 0===t.location?"-":Object(H.jsx)(M.a,{split:Object(H.jsx)(X.a,{type:"vertical"}),children:t.location.stateOrProvince.map((e=>Object(H.jsx)(fe,{uri:e,store:"stateOrProvinceStore"},e)))})},{title:"Deposit Type",key:"depositType",render:(e,t)=>{const o=t.getTop1DepositType();return void 0===o?"-":Object(H.jsx)(fe,{uri:o.uri,store:"depositTypeStore"})}},{title:"Dep. Score",key:"depositConfidence",render:(e,t)=>{const o=t.getTop1DepositType();return void 0===o?"-":o.confidence.toFixed(4)}},{title:"Tonnage (Mt)",dataIndex:"totalTonnage",render:(e,t)=>void 0!==t.gradeTonnage&&void 0!==t.gradeTonnage.totalTonnage?t.gradeTonnage.totalTonnage.toFixed(4):"-"},{title:"Grade (%)",dataIndex:"totalGrade",render:(e,t)=>void 0!==t.gradeTonnage&&void 0!==t.gradeTonnage.totalGrade?t.gradeTonnage.totalGrade.toFixed(2):"-"},{title:"Action",key:"action"}],Oe=Object(L.a)((e=>{let{commodity:t}=e;const{dedupMineralSiteStore:o,commodityStore:i}=E(),[r,n]=Object(s.useState)(void 0);if(Object(s.useEffect)((()=>{void 0!==t&&o.fetchByCommodity(t)}),[t]),"error"===o.state.value)return Object(H.jsx)(Y.a,{message:"Error",description:"An error occurred while querying dedup mineral sites. Please try again later.",type:"error",showIcon:!0});const a="updating"===o.state.value,c=void 0===t||a?je:o.getByCommodity(t);return be[be.length-1].render=(e,t)=>Object(H.jsxs)(M.a,{children:[Object(H.jsx)(Z.a,{color:"primary",size:"middle",icon:Object(H.jsx)(ee.a,{}),variant:"filled",onClick:()=>{t.id===r?n(void 0):n(t.id)},children:"Edit"}),Object(H.jsx)(Z.a,{color:"default",size:"middle",icon:Object(H.jsx)(te.a,{}),variant:"filled",children:"Ungroup"})]}),Object(H.jsx)($.a,{bordered:!0,size:"small",rowKey:"id",columns:be,dataSource:c.records,loading:!!a&&{size:"large"},expandable:{expandedRowRender:e=>Object(H.jsx)(ye,{commodity:t,dedupSite:e}),showExpandColumn:!1,expandedRowKeys:void 0===r?[]:[r]}})})),xe=Object(L.a)((()=>{const[e,t,o]=function(){const{commodityStore:e}=E(),[t,o]=Object(s.useState)({commodity:void 0}),i=Object(s.useMemo)((()=>{if(void 0===t.commodity)return{commodity:void 0};const o=e.getByName(t.commodity);return{commodity:null===o?void 0:o}}),[e.records.size,t.commodity]);return[t,i,e=>{o(e)}]}();return Object(H.jsxs)(A.a,{vertical:!0,gap:"small",children:[Object(H.jsx)(Q,{searchArgs:e,setSearchArgs:o}),Object(H.jsx)(Oe,{commodity:t.commodity})]})}));o(272);var Te=o(180);const Ie={centerNavBar:{justifyContent:"center",boxShadow:"0 2px 8px #f0f1f2"},leftNavBar:{"& .logo::after":{borderBottom:"none !important",transition:"none !important"},"& .logo:hover::after":{borderBottom:"none !important",transition:"none !important"},"& .logo img":{height:24,borderRadius:4,marginTop:-2},paddingLeft:24,paddingRight:24,boxShadow:"0 2px 8px #f0f1f2"}},we=(Object(oe.a)(Ie)((e=>{let{classes:t,menus:o,routes:i,className:r,style:a,isFirstItemLogo:s}=e;const c=Object(W.e)(),d=Object.keys(o).map(((e,t)=>Se(e,!0===s&&0===t?"logo":"",o[e]))),l=Object(n.i)(c,i);return Object(H.jsx)(Te.a,{mode:"horizontal",className:t.centerNavBar+(void 0!==r?" "+r:""),style:a,onClick:e=>{i[e.key].path({},{}).open()},selectedKeys:void 0!==l?[l]:void 0,children:d})})),Object(oe.a)(Ie)((e=>{let{classes:t,menus:o,routes:i,className:r,style:a,isFirstItemLogo:s}=e;const c=Object(W.e)(),d=Object.keys(o).map(((e,t)=>Se(e,!0===s&&0===t?"logo":"",o[e]))),l=Object(n.i)(c,i);return Object(H.jsx)(Te.a,{mode:"horizontal",className:t.leftNavBar+(void 0!==r?" "+r:""),style:a,onClick:e=>{i[e.key].path({},{}).open()},selectedKeys:void 0!==l?[l]:void 0,children:d})})));function Se(e,t,o){let i,r;if("string"===typeof o)i=o;else if(c.a.isValidElement(o))i=o;else{const{children:e,...t}=o;i=e,r=t}return Object(H.jsx)(Te.a.Item,{className:t,...r,children:i},e)}const Re=Object(L.a)((e=>{let{children:t}=e;const{userStore:o}=E();return Object(s.useEffect)((()=>{o.isLoggedIn().then((e=>{e||Ce.login.path().open()}))}),[o]),t})),Ce={login:new n.c({component:()=>{const{userStore:e}=E(),[t,o]=Object(s.useState)(""),[i,r]=Object(s.useState)(""),[n,a]=Object(s.useState)("");Object(s.useEffect)((()=>{e.isLoggedIn().then((e=>{e&&Ce.home.path({commodity:void 0}).open()}))}),[e]);return Object(H.jsxs)("div",{className:"login-container",children:[Object(H.jsx)("h2",{children:"Login"}),Object(H.jsxs)("form",{onSubmit:async o=>{o.preventDefault();try{await e.login(t,i),Ce.home.path({commodity:void 0}).open()}catch(r){a("An error occurred. Please try again later.")}},className:"login-form",children:[Object(H.jsxs)("div",{className:"form-group",children:[Object(H.jsx)("label",{htmlFor:"username",children:"Username:"}),Object(H.jsx)("input",{type:"text",id:"username",value:t,onChange:e=>o(e.target.value),required:!0})]}),Object(H.jsxs)("div",{className:"form-group",children:[Object(H.jsx)("label",{htmlFor:"password",children:"Password:"}),Object(H.jsx)("input",{type:"password",id:"password",value:i,onChange:e=>r(e.target.value),required:!0})]}),n&&Object(H.jsx)("p",{className:"error-message",children:n}),Object(H.jsx)("button",{type:"submit",className:"login-button",children:"Login"})]})]})},pathDef:"".concat(m,"/login"),exact:!0}),home:new n.d({component:xe,pathDef:"".concat(m,"/"),exact:!0,querySchema:{commodity:"optionalstring"}})};window._routes=Ce,Object(n.h)(Ce,(e=>t=>{const o=c.a.createElement(e,t);return Object(H.jsxs)(M.a,{direction:"vertical",style:{width:"100%"},children:[Object(H.jsx)(we,{menus:{home:Object(H.jsx)("span",{children:"MinMod Editor"})},routes:Ce,isFirstItemLogo:!0}),Object(H.jsx)(Re,{children:Object(H.jsx)("div",{className:"wide-container",children:o})})]})}),["login"]);var ze=o(222),_e=o.n(ze),ke=o(18);const Ue=e=>{let{children:t}=e;return Object(s.useEffect)((()=>{Promise.all([F.depositTypeStore.fetchAll(),F.countryStore.fetchAll(),F.stateOrProvinceStore.fetchAll()])}),[]),t};Promise.resolve().then((()=>{r.a.render(Object(H.jsx)(D.Provider,{value:F,children:Object(H.jsx)(ke.a,{locale:_e.a,children:Object(H.jsx)(Ue,{children:Object(H.jsx)(n.a,{enUSLocale:!0,routes:Ce})})})}),document.getElementById("root"))})),a()}},[[281,1,2]]]);
//# sourceMappingURL=main.f646642e.chunk.js.map