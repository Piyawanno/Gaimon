<div class="menuGroup">
    <a rel="link" href="{{{url}}}">
        <div class="menuItem" rel="menu">
            <div class="menuDetail">
                {{#isSVG}}
                <div class="menuSVGIcon">
                    {{{icon}}}
                </div>
                {{/isSVG}}
                {{^isSVG}}
                <div class="menuImgIcon">
                    <img class="menuImg" src="{{icon}}">
                </div>
                {{/isSVG}}
                <div class="menuLabel" localize>{{name}}</div>
            </div>
        </div>
    </a>
    <div class="subMenu" rel="subMenu"></div>
</div>
