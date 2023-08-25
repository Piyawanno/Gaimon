<div>
    <div class="weeklyHeader">
        <div class="weeklyTimeHeader"></div>
        {{#weekdays}}
        <div class="weeklyDay">{{.}}</div>
        {{/weekdays}}
    </div>
    <div class="weeklyDateHeader">
        <div class="weeklyTimeSubHeader"></div>
        {{#days}}
        {{#isDisable}}
        <div class="weeklyDate disable"></div>
        {{/isDisable}}
        {{^isDisable}}
        <div class="weeklyDate">
            <div class="weeklyCellDateText {{#isToday}}today{{/isToday}}" >{{number}}</div>
        </div>
        {{/isDisable}}
        {{/days}}
    </div>
    <div class="weeklyContent">
        {{#hour}}
        <div class="weeklyDateHeader">
            <div class="weeklyTime">{{hour}}</div>
            {{#days}}
            <div class="weeklyEventCell eventCell" rel="event_{{year}}_{{month}}_{{number}}_{{index}}"></div>
            {{/days}}
        </div>
        {{/hour}}
    </div>
</div>