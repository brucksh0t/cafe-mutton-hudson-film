// Cafe Mutton film concept. Hours as posted on cafemutton.com (checked Oct 18, 2026), America/New_York.
// Preview another time: ?now=2026-10-16T18:00
(function(){
  // day -> [open, close, service] in minutes
  var H={3:[1020,1260,'Dinner'],4:[1020,1260,'Dinner'],5:[1020,1260,'Dinner'],6:[600,900,'Brunch'],0:[600,900,'Brunch']};
  var N=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function t(m){var h=Math.floor(m/60),mm=m%60;return (h%12||12)+(mm?':'+(mm<10?'0':'')+mm:'')+(h>=12?' PM':' AM');}
  function now(){var q=new URLSearchParams(location.search).get('now'),m=q&&q.match(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/);
    if(m)return {day:new Date(Date.UTC(+m[1],m[2]-1,+m[3])).getUTCDay(),min:+m[4]*60+ +m[5]};
    var p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value;});
    return {day:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday),min:(+p.hour%24)*60+ +p.minute};}
  function next(n){for(var i=1;i<=7;i++){var d=(n.day+i)%7;if(H[d])return N[d]+' '+H[d][2].toLowerCase()+', '+t(H[d][0]);}}
  // status dots are never red: green open, butter later today, grey closed
  function compute(n){var h=H[n.day];
    if(h&&n.min>=h[0]&&n.min<h[1])return {c:'open',t:'Open now · '+h[2].toLowerCase()+' until '+t(h[1])+'.'};
    if(h&&n.min<h[0])return {c:'later',t:h[2]+' today, '+t(h[0])+'–'+t(h[1])+'.'};
    return {c:'closed',t:'Closed now · next: '+next(n)+'.'};}
  var n=now(),r=compute(n),row=document.querySelector('[data-status]');
  if(row){row.querySelector('.dot').className='dot dot--'+r.c;row.querySelector('[data-text]').innerHTML=r.t+' Holiday hours: <a href="tel:+15186716230">call to confirm</a>.';}
  var tr=document.querySelector('[data-hours] tr[data-day="'+n.day+'"]');if(tr){tr.classList.add('is-today');tr.querySelector('th').insertAdjacentHTML('beforeend',' <span class="tag">· today</span>');}
  window.__cm={compute:compute};

  // menu tabs (works with or without motion)
  var tabs=[].slice.call(document.querySelectorAll('.tab')),bar=document.querySelector('.tabs__bar');
  function place(){var a=document.querySelector('.tab[aria-selected="true"]');if(a&&bar){bar.style.width=a.offsetWidth+'px';bar.style.transform='translateX('+a.offsetLeft+'px)';}}
  function sel(tb,focus){tabs.forEach(function(x){var on=x===tb;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on;});place();if(focus)tb.focus();
    if(window.gsap&&root.classList.contains('motion')){var p=document.getElementById(tb.getAttribute('aria-controls'));gsap.fromTo(p.querySelectorAll('li,.menu__h'),{x:-24,autoAlpha:0},{x:0,autoAlpha:1,duration:.55,stagger:.025,ease:'power3.out',overwrite:true});if(window.ScrollTrigger)ScrollTrigger.refresh();}}
  tabs.forEach(function(tb,i){tb.addEventListener('click',function(){sel(tb);});tb.addEventListener('keydown',function(e){var k=e.key,j=k==='ArrowRight'?i+1:k==='ArrowLeft'?i-1:k==='Home'?0:k==='End'?tabs.length-1:-1;if(j<0)return;e.preventDefault();sel(tabs[(j+tabs.length)%tabs.length],true);});});
  place();addEventListener('resize',place);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);

  var root=document.documentElement;
  function chrome(){var f=document.querySelector('.flag'),nv=document.querySelector('.nav'),fh=f?f.offsetHeight:0,nh=nv?nv.offsetHeight:0;
    root.style.setProperty('--chrome',(fh+nh)+'px');root.style.setProperty('--flag',fh+'px');root.style.setProperty('--navh',nh+'px');}
  chrome();addEventListener('resize',chrome);
  // one filled BOOK DINNER per screen: header/bar copy fills only once the hero CTA has left
  var book=document.querySelector('.mbar .btn--book');
  // the bottom-bar BOOK DINNER is a real primary only once the hero's primary has left; until then it is a ghost (one filled primary per screen)
  function ctaOut(v){v=!!v;root.classList.toggle('cta-out',v);if(book){book.classList.toggle('btn--primary',v);book.classList.toggle('btn--ghost',!v);}}
  // posters for the later films (and the hero sign) are attached after the hero poster, so they don't compete with the first paint
  function hydrate(){[].forEach.call(document.querySelectorAll('[data-srcset]'),function(e){e.srcset=e.dataset.srcset;e.removeAttribute('data-srcset');});
    [].forEach.call(document.querySelectorAll('img[data-src]'),function(e){e.src=e.dataset.src;e.removeAttribute('data-src');});}
  function still(){
    hydrate();
    root.classList.remove('motion');
    var hb=document.querySelector('.cap--hero .btns');
    if(hb&&'IntersectionObserver' in window)new IntersectionObserver(function(es){ctaOut(!es[0].isIntersecting);}).observe(hb);else ctaOut(true);
  }
  if(!/\bmotion\b/.test(root.className)){still();return;}
  // The scroll scenes boot only after the hero poster has painted, so their setup work never delays the first (LCP) paint.
  function boot(){
  hydrate();
  gsap.registerPlugin(ScrollTrigger);
  var mobile=window.matchMedia('(max-width:899px)').matches;
  // Tiers from the 2x upscales: m = 1080x1440 crop for phones/tablets, d = 1920x1080, x = 2560x1440 (large or high-DPR desktop).
  // Preview ladder (mq 360x480 / dq 480x270, every 3rd frame) lands first; the sharp frame replaces it.
  var FV='5',TIERS=[{k:'e',h:900},{k:'d',h:1080},{k:'x',h:1440}],STEP=3;// e = 1600x900, so a 1440x900 desktop draws at exactly 1.0x
  function cap(){return Math.min(window.devicePixelRatio||1,2);}
  // Sharp frames are per-frame AVIF (lowest quality that still matches the master, with a floor), WebP fallback (from The Hill build).
  var ext='webp',extOK=false;
  new Promise(function(res){var t=new Image();t.onload=function(){res(t.width===2);};t.onerror=function(){res(false);};
    t.src='data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAIgAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAgAAAAIAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAKm1kYXQSAAoIGAA2iAhoNCAyFBlHh4Yhh5555oAAAJBAyRxhQoFI';})
    .then(function(a){ext=a?'avif':'webp';extOK=true;pump();});

  // ---------- Film engine: canvas WebP sequences (from the Poured / Hill builds) ----------
  // One clock: the frame index comes only from the pinned timeline's progress, so reverse scrolling restores the same frame.
  // Nothing is requested before the first scroll; then one shared queue fetches what is closest to the reader first.
  function Film(sec){
    this.sec=sec;this.box=sec.parentElement.classList.contains('pin-spacer')?sec.parentElement:sec;
    this.N=+sec.dataset.frames;this.k=mobile?2:(+sec.dataset.dk||1);this.n=Math.floor((this.N-1)/this.k)+1;/* desktop: every frame; phones: every 2nd (weight) */this.name=sec.dataset.film;
    this.cv=sec.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.poster=sec.querySelector('.film__poster');
    this.cur=0;this.dir=1;this.shown=false;this.set=null;this.gen=0;this.reset();this.size();
  }
  Film.prototype.reset=function(){this.gen++;var n=this.n;this.full=new Array(n);this.lq=new Array(n);this.ok=new Uint8Array(n);this.lok=new Uint8Array(n);
    this.req=new Uint8Array(n);this.lreq=new Uint8Array(n);this.drawn=-1;this.drawnQ='';};
  Film.prototype.pick=function(){if(mobile)return 'm';var c=this.cv,need=Math.max((c.clientWidth||innerWidth)*cap()/16*9,(c.clientHeight||innerHeight)*cap()),t=TIERS[0];
    for(var i=0;i<TIERS.length;i++){t=TIERS[i];if(t.h>=need)break;}return t.k;};
  Film.prototype.isL=function(i){return i%STEP===0||i===this.n-1;};
  Film.prototype.src=function(i,lq){var s=String(i*this.k+1);while(s.length<3)s='0'+s;return 'frames/'+this.name+'/'+(lq?'mp':this.set)+'/'+s+'.'+ext+'?v='+FV;};
  Film.prototype.size=function(){var d=cap(),w=this.cv.clientWidth||innerWidth,h=this.cv.clientHeight||innerHeight;
    this.cv.width=Math.round(w*d);this.cv.height=Math.round(h*d);this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='high';
    var t=this.pick();if(t!==this.set){var had=this.set;this.set=t;if(had){this.reset();this.seed();pump();}}
    this.draw(this.fr==null?this.cur:this.fr,true);};
  // the poster is frame 1 (already on screen), so it seeds the canvas without a frame request
  Film.prototype.seed=function(){if(!this.poster)return;var self=this,im=this.poster,g=this.gen;
    // a fresh Image of the chosen poster file (from cache) reports its true pixel size, not the srcset-density size
    function use(){if(g!==self.gen||!im.naturalWidth)return;var t=new Image();t.onload=function(){if(g!==self.gen)return;self.lq[0]=t;self.lok[0]=1;self.lreq[0]=1;self.draw(self.cur,true);};t.src=im.currentSrc||im.src;}
    if(im.complete)use();else im.addEventListener('load',use);};
  Film.prototype.away=function(){var r=this.box.getBoundingClientRect(),h=innerHeight;return r.top>h?(r.top-h)/h:r.bottom<0?-r.bottom/h:0;};
  Film.prototype.state=function(){var im=this.drawnQ==='full'?this.full[this.drawn]:this.lq[this.drawn];
    return {name:this.name,set:this.set,n:this.n,lead:this.lead||0,cur:this.cur,drawn:this.drawn,drawnQ:this.drawnQ,loaded:this.ok.reduce(function(a,b){return a+b;},0),
      previews:this.lok.reduce(function(a,b){return a+b;},0),requested:this.req.reduce(function(a,b){return a+b;},0)+this.lreq.reduce(function(a,b){return a+b;},0),
      cw:this.cv.width,ch:this.cv.height,src:im?im.naturalWidth+'x'+im.naturalHeight:null};};
  // fr is fractional: when both neighbouring sharp frames are loaded they are crossfaded, so the scrub moves continuously between frames
  Film.prototype.paint=function(im,a){var c=this.cv,cw=c.width,ch=c.height,s=Math.max(cw/im.naturalWidth,ch/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;
    this.ctx.globalAlpha=a;this.ctx.drawImage(im,(cw-w)/2,(ch-h)/2,w,h);this.ctx.globalAlpha=1;};
  Film.prototype.draw=function(fr,force){fr=Math.max(0,Math.min(this.n-1,+fr||0));this.fr=fr;var f=Math.round(fr),a=Math.floor(fr),b=Math.min(this.n-1,a+1),t=fr-a;
    if(f!==this.cur)this.dir=f>this.cur?1:-1;var moved=f!==this.cur||Math.abs(t-(this.ft||0))>.01;this.cur=f;if(!moved&&!force)return;
    if(this.ok[a]&&this.ok[b]&&t>.02&&t<.98&&a!==b){this.paint(this.full[a],1);this.paint(this.full[b],t);this.drawn=f;this.drawnQ='full';this.ft=t;this.blend=true;this.shownCheck();pump();return;}
    this.ft=t;
    var bf=-1,bl=-1,d;for(d=0;d<this.n&&(bf<0||bl<0);d++){
      if(bf<0){if(f-d>=0&&this.ok[f-d])bf=f-d;else if(f+d<this.n&&this.ok[f+d])bf=f+d;}
      if(bl<0){if(f-d>=0&&this.lok[f-d])bl=f-d;else if(f+d<this.n&&this.lok[f+d])bl=f+d;}}
    var at=-1,q='';if(bf>=0&&(bl<0||Math.abs(bf-f)<=Math.abs(bl-f)+1.5)){at=bf;q='full';}else if(bl>=0){at=bl;q='lq';}
    if(at<0||(at===this.drawn&&q===this.drawnQ&&!force&&!this.blend))return;
    this.paint(q==='full'?this.full[at]:this.lq[at],1);this.drawn=at;this.drawnQ=q;this.blend=false;this.shownCheck();
    pump();};
  Film.prototype.shownCheck=function(){if(!this.shown){this.shown=true;gsap.to(this.poster,{autoAlpha:0,duration:.4});}};
  Film.prototype.next=function(){var n=this.n,c=this.cur,dir=this.dir,best=-1,bd=1e9,i,d;
    // phones: full-resolution, low-quality previews (every 3rd frame) land first, so slow networks keep up without drawing above 1.0x
    // previews only while the sharp frames are behind: never for a frame whose sharp copy is loaded or requested, only within 12 frames, and not at all once the next 6 sharp frames are in
    if(this.set==='m'){var keep=true;for(d=0;d<=6;d++){i=c+d*dir;if(i<0||i>=n)break;if(!this.ok[i]){keep=false;break;}}
      if(!keep){for(i=0;i<n;i++){if(this.isL(i)&&!this.lreq[i]&&!this.ok[i]&&!this.req[i]&&Math.abs(i-c)<=12){d=(i-c)*dir;d=d>=0?d:-d*1.5;if(d<bd){bd=d;best=i;}}}
        if(best>=0)return {i:best,lq:true,p:bd};}}
    // then every 3rd sharp frame ahead of the scroll direction, then the gaps
    for(i=0;i<n;i++){if(this.isL(i)&&!this.req[i]){d=(i-c)*dir;d=d>=0?d:-d*1.5;if(d<bd){bd=d;best=i;}}}
    if(best>=0)return {i:best,lq:false,p:bd};
    for(i=0;i<n;i++){if(!this.req[i]){d=(i-c)*dir;d=d>=0?d:-d*2+1;if(d<bd){bd=d;best=i;}}}
    return best>=0?{i:best,lq:false,p:1000+bd}:null;};
  var films=[].slice.call(document.querySelectorAll('[data-film]')).map(function(s){return new Film(s);});
  window.__cmFilms=films;
  var started=false,live=0,MAX=3,NEAR=3.5,NEARLQ=4;
  function fetchOne(f,i,lq){var g=f.gen;live++;(lq?f.lreq:f.req)[i]=1;var im=new Image();im.decoding='async';
    function done(okk){live--;if(g===f.gen){if(okk){if(lq){f.lq[i]=im;f.lok[i]=1;}else{f.full[i]=im;f.ok[i]=1;}if(Math.abs(i-f.cur)<=8)f.draw(f.fr==null?f.cur:f.fr,true);}}pump();}
    im.onload=function(){(im.decode?im.decode():Promise.resolve()).then(function(){done(true);},function(){done(true);});};
    im.onerror=function(){var rq=lq?f.lreq:f.req,key=(lq?'l':'f')+i;f.tries=f.tries||{};f.tries[key]=(f.tries[key]||0)+1;
      if(f.tries[key]<3)setTimeout(function(){if(g===f.gen){rq[i]=0;pump();}},700*f.tries[key]);done(false);};// a failed frame (e.g. a CDN 503) is retried twice with backoff; meanwhile drawing uses the nearest loaded frame
    im.src=f.src(i,lq);}
  var pumping=false;
  function pump(){if(!started||!extOK||pumping)return;pumping=true;
    for(;;){var best=null,bp=1e18;
      for(var k=0;k<films.length;k++){var f=films[k],a=f.away();if(a>NEARLQ)continue;var c=f.next();if(!c||(!c.lq&&a>NEAR))continue;
        var p=(c.lq?0:1e6)+a*1e4+c.p;if(p<bp){bp=p;best={f:f,c:c};}}
      if(!best||live>=MAX)break;fetchOne(best.f,best.c.i,best.c.lq);}
    pumping=false;}
  films.forEach(function(f){f.seed();});
  function go(){if(started)return;started=true;['scroll','wheel','touchmove','keydown'].forEach(function(e){removeEventListener(e,go);});pump();}
  ['scroll','wheel','touchmove','keydown'].forEach(function(e){addEventListener(e,go,{passive:true});});
  var sq=0;addEventListener('scroll',function(){if(sq)return;sq=requestAnimationFrame(function(){sq=0;pump();});},{passive:true});
  var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){films.forEach(function(f){f.size();});fitAp();},120);});

  // ---------- Pie aperture: CLOSE cut out of the paper; scale about the L stem until it fills the screen ----------
  var ap=document.querySelector('.aperture'),apT=ap&&ap.querySelector('.ap-t'),apG=ap&&ap.querySelector('.ap-g'),AP={o:[0,0],S:40,p:0};
  function apSet(s){if(apG)apG.setAttribute('transform','translate('+AP.o[0]+' '+AP.o[1]+') scale('+s+') translate('+(-AP.o[0])+' '+(-AP.o[1])+')');}
  function fitAp(){if(!ap)return;var w=ap.clientWidth||innerWidth,h=ap.clientHeight||innerHeight;ap.setAttribute('viewBox','0 0 '+w+' '+h);
    apT.setAttribute('x',w/2);apT.setAttribute('y',h/2);apT.setAttribute('font-size',100);var L=apT.getComputedTextLength()||300;
    var fs=Math.min(100*w*.9/L,h*.42);apT.setAttribute('font-size',fs);
    try{var e=apT.getExtentOfChar(1);AP.o=[e.x+e.width*.2,e.y+e.height*.55];AP.S=Math.max(w,h)*2.4/(e.width*.26);}catch(err){AP.o=[w*.3,h/2];AP.S=60;}
    apSet(1+(AP.S-1)*AP.p);}
  fitAp();

  // crisp caption beats: opacity + short rise, no blur
  function capIn(tl,el,at){tl.fromTo(el,{autoAlpha:0,y:28},{autoAlpha:1,y:0,duration:.6,ease:'power3.out'},at);}
  function capOut(tl,el,at){tl.fromTo(el,{autoAlpha:1,y:0},{autoAlpha:0,y:-20,duration:.5,ease:'power2.in',immediateRender:false},at);}
  var LEN={hero:300,pie:340,glide:300,brunch:240};
  films.forEach(function(f){
    var caps=[].slice.call(f.sec.querySelectorAll('.cap')),isHero=f.name==='hero',o={f:0};
    var tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:f.sec,start:'top top',end:'+='+LEN[f.name]+'%',pin:true,pinSpacer:f.sec.parentElement.classList.contains('pin-spacer')?f.sec.parentElement:undefined,scrub:.5,anticipatePin:1,invalidateOnRefresh:true,
      onUpdate:function(){f.draw(o.f);}, onLeave:function(){if(isHero)ctaOut(true);}}});
    // header CTA follows the hero CTA's actual (scrub-smoothed) opacity, so two filled buttons never share a screen
    var hbtn=isHero&&f.sec.querySelector('.cap--hero .btns a');function syncCta(){if(hbtn)ctaOut(+gsap.getProperty(hbtn,'opacity')<.05||gsap.getProperty(hbtn,'visibility')==='hidden');}
    // hero holds its poster for the first 6% of the pin: the first frames are only requested on the first scroll, so this buys them time on slow networks
    f.lead=isHero?.06:0;tl.to(o,{f:f.n-1,duration:10*(1-f.lead),onUpdate:function(){f.draw(o.f);syncCta();}},10*f.lead);if(f.lead)tl.set({},{},10);
    if(isHero){// the H1 stays in the accessibility tree (opacity only); the buttons leave with visibility so they can't be tabbed to while invisible
      tl.fromTo(caps[0],{opacity:1,y:0},{opacity:0,y:-20,duration:.5,ease:'power2.in',immediateRender:false},2.2);
      tl.fromTo(caps[0].querySelectorAll('a'),{autoAlpha:1},{autoAlpha:0,duration:.5,ease:'power2.in',immediateRender:false},2.2);capIn(tl,caps[1],5.6);
      tl.fromTo(caps[1].querySelector('.sign'),{clipPath:'inset(0 50% 0 50%)'},{clipPath:'inset(0 0% 0 0%)',duration:1.4,ease:'power2.out'},5.7);}
    else if(f.name==='pie'){
      tl.fromTo(AP,{p:0},{p:1,duration:3.4,ease:'expo.in',onUpdate:function(){apSet(1+(AP.S-1)*AP.p);}},.6).fromTo(ap,{opacity:1},{opacity:0,duration:1.0,ease:'power1.inOut',immediateRender:false},3.0).set(ap,{visibility:'hidden'},4.05);// the paper dissolves as the letter opens, so there is never a hard cut
      capIn(tl,caps[0],5.2);}
    else if(f.name==='glide'){var li=f.sec.querySelectorAll('.menu--board li');
      if(mobile){gsap.set(caps[0],{autoAlpha:1});tl.fromTo(li,{x:30,autoAlpha:0},{x:0,autoAlpha:1,stagger:.5,duration:.8,ease:'power3.out'},.6);}
      else{capIn(tl,caps[0],.4);tl.fromTo(li,{x:-40,autoAlpha:0},{x:0,autoAlpha:1,stagger:.55,duration:.8,ease:'power3.out'},1.0);}}
    else{capIn(tl,caps[0],4.6);}
  });
  // pie: when scrolling back above the film, the paper and letters are whole again (scrub reverses the timeline)

  // ---------- Section choreography (crisp: transform + opacity only) ----------
  function split(el){var tmp=document.createElement('div');tmp.innerHTML=el.innerHTML;
    function walk(node,out){[].forEach.call(node.childNodes,function(c){if(c.nodeType===3){c.textContent.split(/(\s+)/).forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){out.appendChild(document.createTextNode(' '));return;}
        var w=document.createElement('span');w.className='w';var s=document.createElement('span');s.textContent=p;w.appendChild(s);out.appendChild(w);});}
      else{var cl=c.cloneNode(false);out.appendChild(cl);walk(c,cl);}});}
    var frag=document.createElement('div');walk(tmp,frag);el.innerHTML=frag.innerHTML;
    return el.querySelectorAll('.w>span');}
  // headings: words rise through line masks
  [].forEach.call(document.querySelectorAll('.lines'),function(el){var lbl=el.textContent.replace(/\s+/g,' ').trim();var ws=split(el);el.setAttribute('aria-label',lbl);[].forEach.call(el.querySelectorAll('.w'),function(w){w.setAttribute('aria-hidden','true');});
    gsap.from(ws,{yPercent:110,duration:.9,ease:'expo.out',stagger:.05,scrollTrigger:{trigger:el,start:'top 86%',once:true}});});
  gsap.utils.toArray('.rv').forEach(function(el){gsap.from(el,{y:26,autoAlpha:0,duration:.75,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});});
  // manifesto: every word lights from dim to full ink with the scroll (all text stays in the DOM)
  var mf=document.querySelector('[data-read]');if(mf){var ws=split(mf);
    gsap.fromTo(ws,{opacity:.16},{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:mf,start:'top 78%',end:'bottom 42%',scrub:true}});}
  // the five feelings sweep in from alternating sides, scrubbed
  gsap.utils.toArray('.feel span').forEach(function(s,i){gsap.fromTo(s,{x:(i%2?1:-1)*Math.min(160,innerWidth*.18),autoAlpha:.0,rotation:(i%2?3:-3)},{x:0,autoAlpha:1,rotation:0,ease:'power2.out',scrollTrigger:{trigger:'.feel',start:'top 92%',end:'top 52%',scrub:.6}});});
  // the menu card sweeps up and squares itself on the table
  var card=document.querySelector('[data-card]');
  if(card){gsap.from(card,{y:110,rotation:-3.5,autoAlpha:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:card,start:'top 88%',once:true}});
    gsap.utils.toArray('#p-din .menu').forEach(function(m){gsap.from(m.children,{x:-28,autoAlpha:0,duration:.7,stagger:.05,ease:'power3.out',scrollTrigger:{trigger:m,start:'top 88%',once:true}});});}
  gsap.fromTo('.numeral',{yPercent:-20},{yPercent:40,ease:'none',scrollTrigger:{trigger:'.menu-sec',start:'top bottom',end:'bottom top',scrub:true}});
  // photo fan opens from a stack with the scroll (G09)
  var fan=gsap.utils.toArray('.fan__i');
  if(fan.length){var tlf=gsap.timeline({scrollTrigger:{trigger:'.fan',start:'top 85%',end:'center 50%',scrub:.6}});
    fan.forEach(function(el,i){tlf.fromTo(el,{xPercent:-50,yPercent:-50,x:0,rotation:(i-1)*1.5,scale:.9},{xPercent:[-100,-50,0][i]+(innerWidth<900?[16,0,-16][i]:0),yPercent:[-50,-56,-44][i],rotation:[-8,2,9][i],scale:1,ease:'power2.out',immediateRender:true},0);});}
  // press: names slide in from alternating sides, then their rule sweeps across
  gsap.utils.toArray('.press__list li').forEach(function(li,i){var l=li.dataset.from==='left';
    gsap.timeline({scrollTrigger:{trigger:li,start:'top 88%',once:true}})
      .from(li.children,{x:l?-70:70,autoAlpha:0,duration:.9,stagger:.12,ease:'expo.out'})
      .fromTo(li,{'--s':0},{'--s':1,duration:.8,ease:'power2.inOut'},.2);});
  // photos: a hard-edged masked wipe opens each clip frame (no rounded iris, no feather)
  gsap.utils.toArray('.iris.clip').forEach(function(el,i){gsap.fromTo(el,{clipPath:i%2?'inset(0% 0% 0% 100%)':'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.1,ease:'expo.inOut',scrollTrigger:{trigger:el,start:'top 84%',once:true}});});
  // paper sections rise on a hard diagonal edge that flattens as they arrive (scrubbed); the manifesto keeps its seam with the CLOSE paper below
  gsap.utils.toArray('.paper').forEach(function(sec){gsap.fromTo(sec,{clipPath:'polygon(0% 14%, 100% 0%, 100% 100%, 0% 100%)'},{clipPath:'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',ease:'none',scrollTrigger:{trigger:sec,start:'top bottom',end:'top 45%',scrub:true}});});
  // impact films are wiped in on a clean edge as they arrive, finishing exactly when the pin starts: the glide from the right (it pans that way), brunch opens from the centre
  [['glide','inset(0% 0% 0% 100%)'],['brunch','inset(0% 50% 0% 50%)']].forEach(function(w){var s=document.querySelector('[data-film="'+w[0]+'"]');if(!s)return;var st=s.querySelector('.film__stage'),bx=s.parentElement.classList.contains('pin-spacer')?s.parentElement:s;
    gsap.fromTo(st,{clipPath:w[1]},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:bx,start:'top bottom',end:'top top',scrub:true}});});
  // Ken Burns clips: sources attach only when the frame reaches the viewport; play once at half visible and hold the last frame (no loop, so no cut)
  var clips=[].slice.call(document.querySelectorAll('.clip__v'));
  if(clips.length&&'IntersectionObserver' in window){var cio=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(!e.isIntersecting)return;
      if(!v.dataset.ld){v.dataset.ld='1';[['webm','video/webm'],['mp4','video/mp4']].forEach(function(x){var so=document.createElement('source');so.src=v.dataset[x[0]];so.type=x[1];v.appendChild(so);});v.load();}
      if(e.intersectionRatio>=.5){cio.unobserve(v);v.addEventListener('playing',function(){v.classList.add('on');},{once:true});var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});}});},{threshold:[0,.5]});
    clips.forEach(function(v){cio.observe(v);});}
  gsap.from('.hours tr',{x:36,autoAlpha:0,duration:.6,stagger:.05,ease:'power3.out',scrollTrigger:{trigger:'.hours',start:'top 88%',once:true}});
  gsap.from('.vis__logo',{clipPath:'inset(0 50% 0 50%)',duration:1.4,ease:'power2.out',scrollTrigger:{trigger:'.vis__logo',start:'top 92%',once:true}});
  function refresh(){chrome();fitAp();ScrollTrigger.refresh();}
  addEventListener('load',refresh);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refresh);
  }
  var booted=false,hp=document.querySelector('[data-film="hero"] .film__poster');
  // GSAP is fetched only after the poster, so it never competes with the first paint for bandwidth
  function load(src){return new Promise(function(res,rej){var e=document.createElement('script');e.src=src;e.onload=res;e.onerror=rej;document.head.appendChild(e);});}
  function go(){if(booted)return;booted=true;requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(fetchMotion,60);});});}
  function fetchMotion(){
    load('js/gsap.min.js').then(function(){return load('js/ScrollTrigger.min.js');}).then(function(){requestAnimationFrame(function(){setTimeout(function(){if(window.gsap&&window.ScrollTrigger)boot();else still();},0);});},still);}
  if(hp&&!(hp.complete&&hp.naturalWidth)){hp.addEventListener('load',go);hp.addEventListener('error',go);setTimeout(go,3000);}else go();
})();
