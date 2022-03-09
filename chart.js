
d3.csv("data/Kaggle_TwitterUSAirlineSentiment.csv").then( data => {

    //    process data from csv into finalData I will use in my chart.
        var finalData = []
        data.forEach( (d) => {
            if( finalData.some( val => val['airline'] == d['airline'] )) {
                finalData.forEach( (x) => {
                    if(x['airline'] == d['airline']) {
                        x['numTweets']++
                        x['airline_sentiment_confidence'].push(Number(d['airline_sentiment_confidence']))
                    }
                })
            } else {
                let newKey = {}
                newKey['airline'] = d['airline']
                newKey['numTweets'] = 1
                newKey['airline_sentiment_confidence'] = [Number(d['airline_sentiment_confidence'])]
                finalData.push(newKey)
            }
        })
        finalData.forEach( d => {
            let sum = 0
            for ( let val of d['airline_sentiment_confidence'] ) {
                sum += val
            }
            d['average_sentiment'] = Math.round(sum / d['airline_sentiment_confidence'].length * 100) / 100
        })
    
    //    I am choosing to show my bar chart into descending order
        finalData.sort( (a,b) => a.numTweets < b.numTweets ? 1 : -1)
    
    //sizing for the chart
        var width = 800
        var height = 600
        var margin = {top: 40, bottom: 40, left: 50, right: 50}
    
    
        var container = d3.select('svg')
                    .attr('width', width - margin.left - margin.right)
                    .attr('height', height - margin.top - margin.bottom)
                    .attr('viewBox', [0, 0, width, height + 100])
    
    //X scale will distribute the values across the xAxis
        var xScale = d3.scaleBand()
                    .domain(finalData.map( d => d.airline))
                    .rangeRound([0,width])
                    .padding(0.1)
        var xScale2 = d3.scalePoint()
                    .domain(finalData.map(d => d.airline))
                    .range([margin.right, width-margin.left])
                    .padding(0.1)
    //There are 2 Y scales, one for the bars, one for line
        var yScaleLeft = d3.scaleLinear()
                    .domain([0,d3.max(finalData.map( d => d.numTweets ))])
                    .range([height - margin.top,0])
        var yScaleRight = d3.scaleLinear()
                    .domain([d3.min( finalData.map(d => d.average_sentiment - 0.1)), 1])
                    .range([height - margin.top , 0])
    
    //Guides will display the ticks and field names, numbers
        var xGuide = container.append('g').call(d3.axisBottom(xScale))
                    .attr('transform', `translate(0,${height + 10})`)
    
        var yGuideLeft = container.append('g').call(d3.axisLeft(yScaleLeft))
                    .attr("transform", `translate(0, ${margin.top})`)
    
        var yGuideRight = container.append('g').call(d3.axisRight(yScaleRight))
                    .attr("transform", `translate(${width}, ${margin.top})`)
    
    // extra labels for acting as a chart legend
        var yLabelLeft = container.append('text')
                    .attr('x', -(height / 2))
                    .attr('y', -margin.top)
                    .attr('transform', 'rotate(-90)')
                    .attr('text-anchor', 'middle')
                    .text('# of Tweets')
                    .style('fill', 'steelblue')
    
        var yLabelRight = container.append('text')
                    .style('transform-origin', 'center')
                    .style('transform-box', 'fill-box')
                    .attr('transform', 'rotate(90)')
                    .attr('text-anchor', 'middle')
                    .attr('x', width + margin.left)
                    .attr('y', height / 2)
                    .text('Avg Airline Sentiment')
                    .style('fill', '#e7822a')
    
    // Rendering the blue bars in th chart.
    //I also toggle the tool tip display here for hovering over the bars using mouseenter event
        var bars = container.selectAll('rect')
                    .data(finalData)
                    .enter()
                    .append('rect')
                    .style('fill', 'steelblue')
                    .attr('width', xScale.bandwidth())
                    .attr('height', data => height - margin.top - yScaleLeft(data.numTweets))
                    .attr('x', data => xScale(data.airline))
                    .attr('y', data => margin.top + yScaleLeft(data.numTweets))
                    .on('mouseenter', function (e, d) {
                        d3.select(this).attr('opacity', 0.5)
                        var tooltip = d3.select('#tooltip')
                          .style('left', e.clientX - 50 + 'px')
                          .style('top', e.clientY + 10 + 'px' )
                          .style('display', 'block')
    
                        tooltip.select('#tweets').text(d.numTweets)
                        tooltip.select('#sentiment').text(d.average_sentiment)
    
                    })
                     .on('mouseleave', function () {
                        d3.select(this).attr('opacity', 1)
                        d3.select('#tooltip')
                            .style('display', 'none')
                    })
        var line = d3.line()
                    .x((d) => xScale2(d.airline))
                    .y((d) => margin.top + yScaleRight(d.average_sentiment))
                    container.append('path').attr('d', line(finalData))
                    .attr('fill', 'none')
                    .attr('stroke', "#e7822a")
                    .attr('stroke-width', 3)
    
                    container.append('g').selectAll('circle').data(finalData)
                    .enter().append('circle').attr('r', 10)
                    .attr("cx", function(d){return xScale2(d.airline)})
                    .attr("cy", function(d){return margin.top + yScaleRight(d.average_sentiment)})
                    .attr("fill", "#e7822a")
    })