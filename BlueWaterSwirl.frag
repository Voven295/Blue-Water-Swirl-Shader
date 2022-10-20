#ifdef GL_ES
precision mediump float;
#endif

const float PI=3.14159265359;
const int Amount=12;
uniform vec2 u_resolution;
uniform float u_time;

mat2 Scale(vec2 scale)
{
    return mat2(scale.x,0.,0.,scale.y);
}

mat2 rotate(float angle)
{
    return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
}

float CircleShape(vec2 position,float radius)
{
    //alpha regulate: CircleShape * value(alpha);
    return smoothstep(radius-.005,radius,length(position-vec2(.5)));
}

vec3 circleShape(in vec2 uv,float radius,float thikness,float fade,vec3 color,float offset)
{
    uv-=offset;
    
    //thikness from 0 (ring) to 1 (circle)
    if(thikness<0.)thikness=0.;
    thikness=radius-(radius*(1.-thikness));
    thikness+=fade;
    
    float distance=1.-length(uv)-1.+radius;
    vec3 c=vec3(smoothstep(0.,fade,distance));
    c*=vec3(smoothstep(thikness,thikness-fade,distance));
    c*=color;
    
    return c;
}

float RectShape(vec2 position,vec2 scale)
{
    scale=vec2(.5)-scale*.5;
    vec2 shaper=vec2(step(scale.x,position.x),step(scale.y,position.y));
    shaper*=vec2(step(scale.x,1.-position.x),step(scale.y,1.-position.y));
    return shaper.x*shaper.y;
}

float PolygonShape(vec2 position,float radius,float sides)
{
    position=position*2.-1.;
    float angle=atan(position.x,position.y);
    float slice=PI*2./sides;
    
    return step(radius,cos(floor(.5+angle/slice)*slice-angle)*length(position));
}

vec3 hypnosisSwirl(vec2 position)
{
    //align to center (if you needed)
    //position+=vec2(0.,-.2);
    
    vec3 color=vec3(0.);
    
    float angle=atan(-position.y+.25,position.x-.5)*.1;
    float len=length(position-vec2(.5,.25));
    
    color+=sin(len*50.+angle*40.+u_time*10.);
    
    return vec3(sin(color.x+u_time),sin(u_time),sin(u_time));
}

vec3 rainbowSwirl(vec2 position)
{
    vec3 color=vec3(0);
    float angle=atan(-position.y+.25,position.x-.5)*.1;
    float len=length(position-vec2(.5,.25));
    
    color.r+=sin(len*50.+angle*40.+u_time*10.)*40.;
    color.g+=cos(len*50.+angle*40.-u_time*10.)*40.;
    //color.b+=cos(len*50.+angle*40.+u_time*10.)*40.;
    
    return color;
}

void main()
{
    float count=100.;
    float weightLine=.01;
    float alphaY=0.;
    
    float brightness=.1;
    float speed=2.;
    float radius=.25;
    float thikness=.9;
    const int lightNumbers=25;
    
    vec3 color=vec3(0,0,0);
    vec2 position=gl_FragCoord.xy/u_resolution;
    float aspect=u_resolution.x/u_resolution.y;
    position.x*=aspect;
    vec2 translate=vec2(-.5,-.5);
    position+=translate;
    
    alphaY=(sin(position.y*count+u_time*speed)+weightLine);
    vec2 center=position+vec2(.5);
    
    float circle=1.-CircleShape(center,radius);
    vec3 swirl=rainbowSwirl(center-vec2(0,.25));
    vec3 portalEffect=vec3(swirl.g*circle*.09,0,0);
    float ring=1.-(1.-CircleShape(center,radius-thikness)+CircleShape(center,radius));
    
    ring*=alphaY;
    color+=(ring+portalEffect.r);
    position=rotate(u_time)*position;
    
    for(int i=0;i<lightNumbers;i++)
    {
        float rad=radians(360./float(lightNumbers))*float(i);
        color.b+=brightness*.1/length(position+vec2((radius-thikness/2.)*cos(rad),(radius-thikness/2.)*sin(rad)));
    }
    gl_FragColor=vec4(color,1.);
}
