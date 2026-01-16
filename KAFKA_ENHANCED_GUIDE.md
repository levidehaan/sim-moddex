# Kafka Enhanced Consumption Guide

## Overview

The Kafka block now supports advanced data extraction, transformation, and aggregation capabilities for consumed messages. This allows you to:

1. **Extract specific fields** from Kafka messages
2. **Apply transformations** (mathematical and textual)
3. **Compute aggregations** across multiple messages
4. **Filter messages** with JavaScript conditions

## Features

### 1. Field Extraction

Extract specific fields from consumed messages using JSONPath-like syntax.

**Configuration:**
```json
[
  {"name": "userId", "path": "value.user.id"},
  {"name": "amount", "path": "value.transaction.amount"},
  {"name": "status", "path": "value.status"}
]
```

**Example Message:**
```json
{
  "key": "order-123",
  "value": {
    "user": {
      "id": "user-456",
      "name": "John Doe"
    },
    "transaction": {
      "amount": 99.99,
      "currency": "USD"
    },
    "status": "completed"
  }
}
```

**Extracted Data:**
```json
{
  "userId": "user-456",
  "amount": 99.99,
  "status": "completed"
}
```

### 2. Transformations

Apply mathematical or textual transformations to extracted fields.

#### Mathematical Operations

- **add** - Add a value
- **subtract** - Subtract a value
- **multiply** - Multiply by a value
- **divide** - Divide by a value

**Example:**
```json
[
  {"field": "amount", "operation": "multiply", "value": 1.1},
  {"field": "price", "operation": "add", "value": 5.0}
]
```

#### Text Operations

- **uppercase** - Convert to uppercase
- **lowercase** - Convert to lowercase
- **trim** - Remove whitespace
- **substring** - Extract substring (requires start/end)

**Example:**
```json
[
  {"field": "status", "operation": "uppercase"},
  {"field": "name", "operation": "trim"},
  {"field": "description", "operation": "substring", "start": 0, "end": 50}
]
```

### 3. Aggregations

Compute aggregations across all consumed messages.

**Supported Operations:**
- **sum** - Sum of all values
- **avg** - Average of all values
- **min** - Minimum value
- **max** - Maximum value
- **count** - Count of non-null values

**Configuration:**
```json
[
  {"field": "amount", "operation": "sum"},
  {"field": "amount", "operation": "avg"},
  {"field": "amount", "operation": "max"}
]
```

**Output:**
```json
{
  "amount_sum": 1234.56,
  "amount_avg": 123.45,
  "amount_max": 500.00
}
```

### 4. Message Filtering

Filter messages using JavaScript expressions.

**Examples:**
- `value.status === "error"`
- `value.amount > 100`
- `value.status === "error" || value.amount > 1000`
- `value.user.country === "US" && value.amount > 50`

## Complete Workflow Examples

### Example 1: Extract and Sum Transaction Amounts

**Scenario:** Consume transactions and calculate total revenue.

```
[Kafka Block]
- Operation: Consume Messages
- Topic: transactions
- Group ID: revenue-calculator
- Max Messages: 100
- Filter Condition: value.status === "completed"
- Extract Fields:
  [
    {"name": "amount", "path": "value.transaction.amount"},
    {"name": "userId", "path": "value.user.id"}
  ]
- Aggregations:
  [
    {"field": "amount", "operation": "sum"},
    {"field": "amount", "operation": "avg"},
    {"field": "amount", "operation": "count"}
  ]

Output:
- extractedData: Array of {amount, userId} objects
- aggregations: {
    amount_sum: 5432.10,
    amount_avg: 54.32,
    amount_count: 100
  }
```

### Example 2: Extract, Transform, and Analyze

**Scenario:** Extract prices, apply tax, and find statistics.

```
[Kafka Block]
- Operation: Consume Messages
- Topic: orders
- Extract Fields:
  [
    {"name": "price", "path": "value.price"},
    {"name": "productName", "path": "value.product.name"}
  ]
- Transformations:
  [
    {"field": "price", "operation": "multiply", "value": 1.08},
    {"field": "productName", "operation": "uppercase"}
  ]
- Aggregations:
  [
    {"field": "price", "operation": "sum"},
    {"field": "price", "operation": "min"},
    {"field": "price", "operation": "max"}
  ]

Output:
- extractedData: [{price: 108.00, productName: "WIDGET"}, ...]
- aggregations: {
    price_sum: 10800.00,
    price_min: 10.80,
    price_max: 540.00
  }
```

### Example 3: Error Monitoring with Text Processing

**Scenario:** Monitor error logs and extract key information.

```
[Kafka Block]
- Operation: Consume Messages
- Topic: application-logs
- Filter Condition: value.level === "ERROR"
- Extract Fields:
  [
    {"name": "message", "path": "value.message"},
    {"name": "service", "path": "value.service"},
    {"name": "timestamp", "path": "value.timestamp"}
  ]
- Transformations:
  [
    {"field": "service", "operation": "uppercase"},
    {"field": "message", "operation": "substring", "start": 0, "end": 100}
  ]
- Aggregations:
  [
    {"field": "message", "operation": "count"}
  ]

Output:
- extractedData: Error details with truncated messages
- aggregations: {message_count: 15}
```

### Example 4: Multi-Stage Processing Pipeline

**Scenario:** Complex data processing with multiple steps.

```
1. [Kafka Block - Consume]
   - Topic: raw-events
   - Extract Fields: [{"name": "value", "path": "value.metric.value"}]
   - Transformations: [{"field": "value", "operation": "multiply", "value": 100}]
   
2. [Condition Block]
   - If: {{kafka.aggregations.value_avg}} > 75
   
3. [Kafka Block - Produce Alert]
   - Topic: alerts
   - Message: High average detected: {{kafka.aggregations.value_avg}}
```

### Example 5: Real-Time Analytics Dashboard

**Scenario:** Build analytics from streaming data.

```
[Loop - Every 10 seconds]
  ↓
[Kafka Block]
- Topic: user-events
- Max Messages: 1000
- Extract Fields:
  [
    {"name": "eventType", "path": "value.event"},
    {"name": "duration", "path": "value.duration"},
    {"name": "userId", "path": "value.userId"}
  ]
- Aggregations:
  [
    {"field": "duration", "operation": "avg"},
    {"field": "duration", "operation": "max"},
    {"field": "userId", "operation": "count"}
  ]
  ↓
[Store in Database]
- Metrics: {{kafka.aggregations}}
```

## Field Path Syntax

The field extraction uses dot notation to navigate nested objects:

```
value.user.id           → message.value.user.id
value.transaction.items → message.value.transaction.items
key                     → message.key
headers.correlationId   → message.headers.correlationId
```

## Transformation Chaining

You can apply multiple transformations to the same field:

```json
[
  {"field": "price", "operation": "multiply", "value": 1.08},
  {"field": "price", "operation": "add", "value": 2.50}
]
```

This will first multiply by 1.08 (add 8% tax), then add 2.50 (shipping fee).

## Best Practices

### 1. Field Extraction
- **Extract only what you need** - Reduces memory usage
- **Use descriptive names** - Makes downstream processing easier
- **Validate paths** - Ensure fields exist in your messages

### 2. Transformations
- **Order matters** - Transformations are applied sequentially
- **Type safety** - Math operations convert to numbers automatically
- **Error handling** - Invalid operations return original value

### 3. Aggregations
- **Numeric fields only** - Aggregations work on numbers
- **Consider message volume** - Large datasets may take time
- **Use appropriate operations** - Choose sum/avg/min/max based on use case

### 4. Filtering
- **Filter early** - Reduces processing overhead
- **Use simple expressions** - Complex logic may slow consumption
- **Test conditions** - Verify filter logic with sample data

## Performance Tips

1. **Limit message count** - Use `maxMessages` to control batch size
2. **Use specific filters** - Reduce unnecessary message processing
3. **Extract selectively** - Only extract fields you'll use
4. **Batch aggregations** - Compute multiple aggregations in one pass
5. **Set appropriate timeouts** - Balance between waiting and responsiveness

## Error Handling

### Invalid Field Paths
If a field path doesn't exist, the extracted value will be `undefined`.

### Type Mismatches
- Math operations on non-numeric values return the original value
- Text operations convert values to strings

### Aggregation Errors
- Non-numeric values are skipped in aggregations
- Empty result sets return 0 for sum/avg/min/max

## Output Structure

```json
{
  "success": true,
  "output": {
    "message": "Consumed 100 messages from topic transactions",
    "topic": "transactions",
    "groupId": "my-consumer-group",
    "messageCount": 100,
    "messages": [
      {
        "key": "order-123",
        "value": {...},
        "headers": {...},
        "partition": 0,
        "offset": "12345",
        "timestamp": "1234567890000"
      }
    ],
    "extractedData": [
      {
        "userId": "user-456",
        "amount": 108.00
      }
    ],
    "aggregations": {
      "amount_sum": 10800.00,
      "amount_avg": 108.00,
      "amount_count": 100
    }
  }
}
```

## Integration Patterns

### Pattern 1: ETL Pipeline
```
Kafka (Extract) → Transform → Load to Database
```

### Pattern 2: Real-Time Monitoring
```
Kafka (Filter Errors) → Extract Details → Send Alert
```

### Pattern 3: Analytics Dashboard
```
Kafka (Consume) → Extract Metrics → Aggregate → Display
```

### Pattern 4: Data Enrichment
```
Kafka (Extract IDs) → Lookup Details → Combine → Produce Enriched
```

## Troubleshooting

### Issue: No data extracted
- **Check field paths** - Verify they match your message structure
- **Inspect raw messages** - Look at `messages` array in output
- **Test with simple path** - Try `value` first, then drill down

### Issue: Transformations not applied
- **Verify field names** - Must match extraction names exactly
- **Check operation types** - Ensure math ops on numbers, text ops on strings
- **Review order** - Transformations apply in sequence

### Issue: Aggregations return 0
- **Confirm numeric values** - Aggregations need numbers
- **Check extraction** - Ensure fields are extracted correctly
- **Verify data exists** - Check if messages contain expected values

## Advanced Use Cases

### Use Case 1: Fraud Detection
Extract transaction amounts, apply risk scoring transformations, aggregate suspicious activity counts.

### Use Case 2: Performance Monitoring
Extract response times, calculate percentiles (using multiple aggregations), trigger alerts on thresholds.

### Use Case 3: User Behavior Analysis
Extract user actions, transform timestamps, count events by type, identify patterns.

### Use Case 4: Financial Reporting
Extract transaction data, apply currency conversions, sum by category, generate reports.

### Use Case 5: IoT Data Processing
Extract sensor readings, apply calibration transformations, compute averages, detect anomalies.

## API Reference

### Extract Fields Format
```typescript
{
  name: string      // Output field name
  path: string      // JSONPath to value (dot notation)
}
```

### Transformation Format
```typescript
{
  field: string     // Field name to transform
  operation: string // Operation type
  value?: number | string  // Operand for math/text ops
  start?: number    // Start index for substring
  end?: number      // End index for substring
}
```

### Aggregation Format
```typescript
{
  field: string     // Field name to aggregate
  operation: string // Aggregation type (sum/avg/min/max/count)
}
```

## Resources

- Kafka Documentation: https://kafka.apache.org/documentation/
- JSONPath Guide: https://goessner.net/articles/JsonPath/
- JavaScript Expressions: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators
