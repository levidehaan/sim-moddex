# ComfyUI Integration Guide

## Overview

The ComfyUI block provides comprehensive integration with ComfyUI servers for advanced image generation workflows. ComfyUI is a powerful node-based interface for Stable Diffusion that allows complex image generation pipelines.

## Features

### ✅ Fully Implemented

1. **Queue Prompt (Generate Images)**
   - Send workflow JSON to ComfyUI
   - Wait for completion or return immediately
   - Automatic polling for results
   - Returns generated images with URLs and metadata

2. **Upload Images**
   - Upload images to ComfyUI server
   - Supports base64, data URI, and URL formats
   - Automatic format conversion

3. **Get Images**
   - Retrieve generated images
   - Download from output, input, or temp folders
   - Returns base64 encoded data

4. **Get History**
   - Retrieve execution history
   - Get specific prompt results
   - View all outputs and status

5. **Get Queue Status**
   - Check current queue state
   - See running and pending jobs

6. **Get System Stats**
   - Monitor GPU/CPU usage
   - Check VRAM availability
   - System information

7. **Interrupt Generation**
   - Stop current generation
   - Cancel running jobs

## API Endpoints

### Base URL
Default: `http://127.0.0.1:8188`

### Endpoints

#### 1. Queue Prompt
```
POST /prompt
Body: { "prompt": <workflow_json> }
Response: { "prompt_id": "..." }
```

#### 2. Get History
```
GET /history/{prompt_id}
Response: { "<prompt_id>": { "outputs": {...}, "status": {...} } }
```

#### 3. Get Queue
```
GET /queue
Response: { "queue_running": [...], "queue_pending": [...] }
```

#### 4. Get System Stats
```
GET /system_stats
Response: { "system": {...}, "devices": [...] }
```

#### 5. Upload Image
```
POST /upload/image
Content-Type: multipart/form-data
Body: FormData with image file
Response: { "name": "...", "subfolder": "...", "type": "..." }
```

#### 6. Get Image
```
GET /view?filename=<name>&subfolder=<path>&type=<output|input|temp>
Response: Image binary data
```

#### 7. Interrupt
```
POST /interrupt
Response: Success status
```

## Workflow Integration Patterns

### Pattern 1: Simple Text-to-Image

```
1. [User Input] → prompt text
2. [ComfyUI Block]
   - Operation: Queue Prompt
   - Workflow: <your_workflow_json>
   - Wait for Completion: Yes
3. [Image Block]
   - Operation: Display Image
   - Image Input: {{comfyui.images[0].url}}
```

### Pattern 2: Image-to-Image with Upload

```
1. [Image Block] → Get source image
2. [ComfyUI Block - Upload]
   - Operation: Upload Image
   - Image Data: {{image.imageBase64}}
   - Image Name: input.png
3. [ComfyUI Block - Generate]
   - Operation: Queue Prompt
   - Workflow: <workflow_with_uploaded_image>
   - Wait for Completion: Yes
4. [Image Block] → Display result
```

### Pattern 3: Batch Processing

```
1. [Loop] → Over array of prompts
2. [ComfyUI Block]
   - Operation: Queue Prompt
   - Workflow: <workflow_with_{{item}}>
   - Wait for Completion: No
   - Store prompt IDs
3. [Delay] → Wait for all to complete
4. [Loop] → Over prompt IDs
5. [ComfyUI Block]
   - Operation: Get History
   - Prompt ID: {{item}}
6. [Image Block] → Display results
```

### Pattern 4: Monitor and Control

```
1. [ComfyUI Block - Queue Status]
   - Operation: Get Queue Status
2. [Condition] → If queue too long
3. [ComfyUI Block - Interrupt]
   - Operation: Interrupt
4. [ComfyUI Block - System Stats]
   - Operation: Get System Stats
   - Check VRAM availability
```

## Workflow JSON Format

ComfyUI workflows must be in API format. Export from ComfyUI using:
**Menu → Save (API Format)**

Example workflow structure:
```json
{
  "3": {
    "inputs": {
      "seed": 42,
      "steps": 20,
      "cfg": 7.0,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1.0,
      "model": ["4", 0],
      "positive": ["6", 0],
      "negative": ["7", 0],
      "latent_image": ["5", 0]
    },
    "class_type": "KSampler"
  },
  "4": {
    "inputs": {
      "ckpt_name": "sd_xl_base_1.0.safetensors"
    },
    "class_type": "CheckpointLoaderSimple"
  },
  ...
}
```

## Image Formats

### Input Formats (Upload)
- **Base64**: Raw base64 string
- **Data URI**: `data:image/png;base64,iVBORw0KG...`
- **URL**: `https://example.com/image.png`

### Output Formats (Download)
- **URL**: Direct link to ComfyUI server
- **Base64**: Encoded image data
- **Data URI**: Ready for display/embedding

## Error Handling

### Common Errors

1. **Connection Refused**
   - Ensure ComfyUI server is running
   - Check server URL and port
   - Verify firewall settings

2. **Timeout**
   - Increase timeout value
   - Check generation complexity
   - Monitor system resources

3. **Invalid Workflow**
   - Verify JSON format
   - Check node connections
   - Ensure all required inputs

4. **Out of Memory**
   - Reduce image size
   - Lower batch size
   - Check system stats
   - Free VRAM

## Performance Tips

1. **Use Wait for Completion Wisely**
   - Set to `No` for batch jobs
   - Set to `Yes` for single images
   - Manually poll for batch results

2. **Optimize Workflows**
   - Reduce unnecessary nodes
   - Use efficient samplers
   - Optimize step count

3. **Monitor Resources**
   - Check system stats regularly
   - Watch VRAM usage
   - Clear queue when needed

4. **Batch Processing**
   - Queue multiple prompts
   - Process in parallel
   - Retrieve results together

## Integration with Other Blocks

### With Image Generator Block
```
1. [Image Generator] → Generate base image with AI
2. [Image Block] → Convert to base64
3. [ComfyUI] → Upload and refine
4. [Image Block] → Display final result
```

### With Vision Models
```
1. [ComfyUI] → Generate image
2. [Image Block] → Convert format
3. [Chat Block with Vision] → Analyze image
4. [ComfyUI] → Regenerate based on feedback
```

### With Image Block
```
1. [ComfyUI] → Generate
2. [Image Block] → Display/Convert/Info
3. [Next Block] → Use in various formats
```

## Best Practices

1. **Always validate workflow JSON** before sending
2. **Use appropriate timeouts** for complex generations
3. **Monitor queue status** for batch processing
4. **Handle errors gracefully** with fallbacks
5. **Clean up temp files** periodically
6. **Use system stats** to prevent overload
7. **Store prompt IDs** for later retrieval
8. **Convert images** to appropriate formats

## Troubleshooting

### Issue: Images not appearing
- Check image URLs are accessible
- Verify base64 encoding is correct
- Ensure ComfyUI server is reachable

### Issue: Slow generation
- Reduce steps or image size
- Check system stats for bottlenecks
- Use faster samplers

### Issue: Workflow errors
- Validate JSON format
- Check all node inputs
- Verify model files exist

### Issue: Memory errors
- Reduce batch size
- Lower image resolution
- Clear VRAM between runs

## Advanced Usage

### Custom Workflows
Create specialized workflows in ComfyUI and export as API format. Store in variables or database for reuse.

### Dynamic Parameters
Modify workflow JSON programmatically to inject dynamic values like prompts, seeds, or model names.

### Pipeline Chaining
Chain multiple ComfyUI operations together for complex multi-stage generation pipelines.

### Conditional Generation
Use Condition blocks to route to different workflows based on results or system state.

## Resources

- ComfyUI GitHub: https://github.com/comfyanonymous/ComfyUI
- ComfyUI Wiki: https://github.com/comfyanonymous/ComfyUI/wiki
- API Documentation: Check ComfyUI server `/docs` endpoint
- Community Workflows: ComfyUI community forums and Discord
