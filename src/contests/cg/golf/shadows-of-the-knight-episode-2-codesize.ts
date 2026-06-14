var [W,H]=readline().split(" ").map(eval)
readline()
var [x,y]=readline().split(" ").map(eval),A=0,B=W-1,C=0,D=H-1,M=Math,a=-1,p=0,q=0
var T=(l,h,o,S)=>{var c=l+h-o;if(c<0||c>S-1){var b=c<0?0:S-1,i=(o+b)/2;c=i>l&&i<h?b:o<l?l:h}if(c==o)c+=c<h?1:-1;return c}
for(;;){
 var d=readline()
 if(d!="UNKNOWN"&&a>=0){
  var m=(p+q)/2
  if(d=="SAME"){if(a<1)A=B=M.round(m);else C=D=M.round(m)}
  else{var s=(q>p)==(d=="WARMER")
   if(a<1){if(s)A=M.floor(m)+1;else B=M.ceil(m)-1}
   else{if(s)C=M.floor(m)+1;else D=M.ceil(m)-1}}
 }
 if(A<B){a=0;p=x;q=T(A,B,x,W);x=q}
 else if(C<D){a=1;p=y;q=T(C,D,y,H);y=q}
 else{a=-1;x=A;y=C}
 console.log(x+" "+y)
}