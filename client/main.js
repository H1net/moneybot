// Computed collection. See seriesData publication.
SeriesData = new Mongo.Collection('seriesData');

Template.body.onCreated(function() {
  this.limit = new ReactiveVar(20);
});

Template.body.onRendered( function () {
  this.subscribe('currencies');
  this.subscribe('totalCurr');
  this.subscribe('totalPairs');
  this.subscribe('totalGrowths');
  this.subscribe('totalHist');

  this.autorun(function() {
    this.subscribe('seriesData', this.limit.get());
  }.bind(this));

  this.autorun(function() {
    console.log('rendering');
    builtArea(SeriesData.find({}, {sort: {time: 1}}).fetch());
  });
});

Template.body.helpers({
  totalCurr() {
    return Counts.get('totalCurr');
  },
  totalPairs() {
    return Counts.get('totalPairs');
  },
  totalGrowths() {
    return Counts.get('totalGrowths');
  },
  totalHist() {
    return Counts.get('totalHist');
  },
  limit() {
    return Template.instance().limit.get();
  }
});

Template.body.events({
  'change #reactive': function (event, template) {
    var limit = $(event.target).val();
    template.limit.set(limit);
  }
});

// Function to draw the area chart

function builtArea(series) {
  _.forEach(series, function(oneSeries) {
    let lastDataValue = numeral(oneSeries.data[oneSeries.data.length - 1])
      .format('0.00') + '%';
      
    _.extend(oneSeries, {
      currentValue: lastDataValue});
  });
  
  $('#container-area').highcharts({
    title: {text: 'Currency Growth'},
    credits: {enabled: false},
    subtitle: {enabled: false},
    xAxis: {
      allowDecimals: false,
      labels: {
        formatter: function () {
          return this.value; // clean, unformatted number for year
        }
      }
    },

    yAxis: {
      title: {
        text: 'Percent Growth'
      },
      labels: {
        formatter: function () {
          return this.value + '%';
        }
      }
    },
    tooltip: {
      formatter: function() {
        return `${this.series.options._id}: ${numeral(this.point.y).format('0.00') + '%'}`;
      }
    },
    plotOptions: {
      line: {
        pointStart: 0,
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
          states: {
            hover: {
              enabled: true
            }
          }
        }
      }
    },

    series: series
  });
}
