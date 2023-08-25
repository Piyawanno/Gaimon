<div class="calendarContainer">
    <div class="calendarHeaderBar">
        <div class="calendarHeaderBox">
            <div class="todayButton" rel="today" localize>Today</div>
            <div class="calendarPagination">
                <div class="calendarPaginationButton pointer" rel="back">
                    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                    </svg>
                </div>
                <div class="calendarPaginationButton pointer" rel="next">
                    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                    </svg>
                </div>
            </div>
            <div class="calendarCurrentText" rel="current">Text</div>
        </div>
        <div>
            <select class="calendarTypeSelect" rel="calendarType">
                <option value="1" rel="day" localize>Day</option>
                <option value="2" rel="week" localize>Week</option>
                <option value="3" rel="month" selected localize>Month</option>
                <option value="4" rel="schedule" localize>Schedule</option>
            </select>
        </div>
    </div>
    <div rel="calendar"></div>
</div>