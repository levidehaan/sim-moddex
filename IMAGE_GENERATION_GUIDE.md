# Image Generation Guide

## Overview

The Image Generator block now supports three powerful operation modes for comprehensive image generation workflows using AI models via OpenRouter.

## Operation Modes

### 1. Text to Image
**Classic text-to-image generation** - Generate images from text descriptions only.

**Use Cases:**
- Create original artwork from descriptions
- Generate product mockups
- Create illustrations for content
- Design concepts and prototypes

**Example Workflow:**
```
[Image Generator]
- Operation: Text to Image
- Model: black-forest-labs/flux-1.1-pro
- Prompt: "A futuristic city at sunset, cyberpunk style, neon lights"
- Width: 1024
- Height: 1024
```

### 2. Image to Image (Modify)
**Modify existing images** - Transform or edit images while preserving structure.

**Use Cases:**
- Style transfer (make photo look like painting)
- Image enhancement and upscaling
- Color grading and filters
- Object replacement or modification
- Artistic transformations

**Parameters:**
- **Input Image**: Source image to modify (URL, base64, or data URI)
- **Image Strength**: 0.0-1.0 (higher = more preservation of original)
  - 0.9-1.0: Subtle changes, strong preservation
  - 0.7-0.8: Moderate changes
  - 0.3-0.6: Significant transformation
  - 0.0-0.2: Major changes, minimal preservation

**Example Workflow:**
```
[Image Block] → Get source image
  ↓
[Image Generator]
- Operation: Image to Image (Modify)
- Model: google/gemini-flash-1.5-8b
- Input Image: {{image.imageDataUri}}
- Image Strength: 0.8
- Prompt: "Transform into watercolor painting style"
  ↓
[Image Block] → Display result
```

### 3. Image + Text to Image (Reference)
**Use image as reference** - Generate new images inspired by a reference image.

**Use Cases:**
- Create variations of existing images
- Generate similar compositions
- Match style or mood of reference
- Create themed content sets
- Product variations

**Example Workflow:**
```
[Image Block] → Load reference image
  ↓
[Image Generator]
- Operation: Image + Text to Image (Reference)
- Model: black-forest-labs/flux-1.1-pro
- Input Image: {{reference.imageDataUri}}
- Prompt: "Same composition but in a forest setting, autumn colors"
  ↓
[Image Block] → Display new image
```

## Supported Models

### Best for Image-to-Image
- **Google Gemini Models** (gemini-flash, gemini-pro)
  - Excellent at understanding and modifying images
  - Can describe, analyze, and transform
  - Supports complex instructions

- **Flux Models** (flux-1.1-pro, flux-pro)
  - High quality transformations
  - Good style transfer
  - Fast generation

- **Stable Diffusion XL**
  - Great for artistic styles
  - Good control over modifications

### Best for Text-to-Image
- **Flux 1.1 Pro** - Highest quality, best prompt following
- **DALL-E 3** - Excellent for realistic images
- **Stable Diffusion XL** - Great for artistic styles
- **Midjourney** - Artistic and creative outputs

## Complete Workflow Examples

### Example 1: Photo Enhancement Pipeline
```
1. [Image Block - Get Source]
   - Operation: Pass Through
   - Image Input: {{user_upload}}

2. [Image Generator - Enhance]
   - Operation: Image to Image
   - Model: google/gemini-flash-1.5-8b
   - Input Image: {{step1.imageDataUri}}
   - Image Strength: 0.9
   - Prompt: "Enhance quality, improve lighting, sharpen details"

3. [Image Block - Display]
   - Operation: Display Image
   - Image Input: {{step2.imageDataUri}}
```

### Example 2: Style Transfer
```
1. [Image Block - Load Photo]
   - Image Input: https://example.com/photo.jpg

2. [Image Generator - Apply Style]
   - Operation: Image to Image
   - Model: black-forest-labs/flux-1.1-pro
   - Input Image: {{step1.imageBase64}}
   - Image Strength: 0.7
   - Prompt: "Van Gogh style painting, swirling brushstrokes, vibrant colors"

3. [Image Block - Convert]
   - Operation: Convert Format
   - Output Format: All Formats
```

### Example 3: Product Variation Generator
```
1. [Image Block - Reference Product]
   - Image Input: {{product_image}}

2. [Loop] → Over color variations
   
3. [Image Generator - Create Variation]
   - Operation: Image + Text to Image (Reference)
   - Model: black-forest-labs/flux-1.1-pro
   - Input Image: {{step1.imageDataUri}}
   - Prompt: "Same product in {{item.color}} color"

4. [Image Block - Save Each]
   - Operation: Pass Through
   - Embed in Output: Yes
```

### Example 4: ComfyUI Integration
```
1. [Image Generator - Initial Generation]
   - Operation: Text to Image
   - Model: black-forest-labs/flux-1.1-pro
   - Prompt: "Concept art of a dragon"

2. [Image Block - Convert]
   - Operation: Convert Format
   - Output Format: Base64

3. [ComfyUI - Refine]
   - Operation: Upload Image
   - Image Data: {{step2.imageBase64}}

4. [ComfyUI - Process]
   - Operation: Queue Prompt
   - Workflow: <upscale_and_detail_workflow>

5. [Image Block - Display Final]
   - Image Input: {{step4.images[0].url}}
```

### Example 5: Image Analysis and Regeneration
```
1. [Image Block - Load Image]
   - Image Input: {{source_image}}

2. [Chat with Vision Model]
   - Model: google/gemini-flash-1.5-8b
   - Message: "Describe this image in detail"
   - Image: {{step1.imageDataUri}}

3. [Image Generator - Recreate]
   - Operation: Text to Image
   - Model: black-forest-labs/flux-1.1-pro
   - Prompt: {{step2.response}}

4. [Condition] → Compare results
```

## Tips and Best Practices

### Image Strength Guidelines
- **0.9-1.0**: Color correction, subtle enhancements
- **0.7-0.8**: Style transfer, moderate changes
- **0.5-0.6**: Significant transformations
- **0.3-0.4**: Major changes, loose interpretation
- **0.0-0.2**: Almost new image, minimal reference

### Prompt Writing for Image-to-Image
- **Be specific about changes**: "Change sky to sunset" vs "make it better"
- **Describe what to keep**: "Keep the composition and subjects"
- **Specify style**: "In watercolor style" or "Photorealistic"
- **Use negative prompts**: Exclude unwanted elements

### Model Selection
- **Gemini**: Best for understanding complex instructions
- **Flux**: Best for quality and prompt adherence
- **Stable Diffusion**: Best for artistic styles
- **DALL-E**: Best for realistic photos

### Performance Optimization
1. Start with lower resolution for testing
2. Use appropriate image strength
3. Batch similar operations
4. Cache intermediate results
5. Use Image Block for format conversions

### Error Handling
- Always validate input images exist
- Check image formats are supported
- Handle API timeouts gracefully
- Provide fallback options
- Log errors for debugging

## Integration Patterns

### Pattern 1: Image Enhancement Chain
```
Source → Enhance → Upscale → Style → Output
```

### Pattern 2: Variation Generator
```
Reference → [Loop: Generate Variations] → Gallery
```

### Pattern 3: Iterative Refinement
```
Generate → Analyze → Modify → Repeat until satisfied
```

### Pattern 4: Multi-Model Pipeline
```
Flux (Generate) → ComfyUI (Refine) → Gemini (Analyze) → Final
```

## Common Use Cases

### 1. E-commerce Product Images
- Generate product variations
- Change backgrounds
- Create lifestyle shots
- Style consistency

### 2. Content Creation
- Blog post illustrations
- Social media graphics
- Marketing materials
- Brand assets

### 3. Design Iteration
- Concept exploration
- Style variations
- Color schemes
- Layout options

### 4. Photo Editing
- Style transfer
- Enhancement
- Restoration
- Creative effects

### 5. Art Generation
- Original artwork
- Style mixing
- Artistic interpretations
- Creative variations

## Troubleshooting

### Issue: Image not being modified
- **Solution**: Lower image strength (try 0.5-0.7)
- **Solution**: Make prompt more specific
- **Solution**: Try different model

### Issue: Too much change from original
- **Solution**: Increase image strength (0.8-0.9)
- **Solution**: Add "preserve composition" to prompt
- **Solution**: Use image_reference mode instead

### Issue: Poor quality output
- **Solution**: Increase resolution
- **Solution**: Add quality keywords to prompt
- **Solution**: Try different model
- **Solution**: Adjust steps parameter

### Issue: Model doesn't support image input
- **Solution**: Check model capabilities
- **Solution**: Use text-to-image mode
- **Solution**: Try Gemini or Flux models

## Advanced Techniques

### Technique 1: Multi-Pass Enhancement
Generate → Upscale → Enhance → Style → Final Polish

### Technique 2: Reference Blending
Use multiple reference images in sequence

### Technique 3: Conditional Generation
Analyze image first, then generate based on analysis

### Technique 4: Style Transfer Chain
Apply multiple styles in sequence for unique results

### Technique 5: Feedback Loop
Generate → Evaluate → Adjust → Regenerate

## API Reference

### Image Input Formats
- **URL**: `https://example.com/image.jpg`
- **Data URI**: `data:image/png;base64,iVBORw0KG...`
- **Base64**: Raw base64 string

### Output Formats
- **imageUrl**: Direct URL (if available)
- **imageBase64**: Base64 encoded data
- **imageDataUri**: Data URI format
- **model**: Model used
- **seed**: Seed used (if specified)

## Resources

- OpenRouter Models: https://openrouter.ai/models
- Flux Documentation: https://blackforestlabs.ai
- Gemini Vision: https://ai.google.dev/gemini-api/docs/vision
- ComfyUI Integration: See COMFYUI_INTEGRATION.md
