<div>
    <div class="weeklyHeader">
        <div class="weeklyTimeHeader"></div>
        <div class="dailyDay">{{day}}</div>
    </div>
    <div class="weeklyDateHeader">
        <div class="weeklyTimeSubHeader"></div>
        <div class="dailyDate">
            <div class="weeklyCellDateText {{#isToday}}today{{/isToday}}">{{date}}</div>
        </div>
    </div>
    <div class="weeklyContent">
        {{#hour}}
        <div class="weeklyDateHeader">
            <div class="weeklyTime">{{hour}}</div>
            <div class="dailyEventCell eventCell" rel="event_{{year}}_{{month}}_{{date}}_{{index}}"></div>
        </div>
        {{/hour}}
    </div>
</div>