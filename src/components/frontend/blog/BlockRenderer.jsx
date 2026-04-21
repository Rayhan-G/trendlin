// src/components/frontend/blog/BlockRenderer.jsx
const BlockRenderer = ({ block }) => {
  const getPaddingClass = (padding) => {
    switch(padding) {
      case 'small': return 'p-4 md:p-6';
      case 'medium': return 'p-6 md:p-8';
      case 'large': return 'p-8 md:p-12';
      default: return 'p-6';
    }
  };

  const getBorderRadiusClass = (radius) => {
    switch(radius) {
      case 'small': return 'rounded-lg';
      case 'medium': return 'rounded-xl';
      case 'large': return 'rounded-2xl';
      default: return 'rounded-none';
    }
  };

  const getAlignmentClass = (alignment) => {
    switch(alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const blockStyle = {
    backgroundColor: block.design?.backgroundColor,
    color: block.design?.textColor,
    backgroundImage: block.design?.backgroundImage ? `url(${block.design.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const renderBlockContent = (block) => {
    switch(block.type) {
      case 'text':
        return <div dangerouslySetInnerHTML={{ __html: block.content?.text || block.content?.html || '' }} className="prose dark:prose-invert max-w-none" />;
      
      case 'image':
        return (
          <figure className="space-y-2">
            <img 
              src={block.content?.imageUrl || block.props?.src} 
              alt={block.content?.alt || block.props?.alt} 
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
            {block.content?.caption && (
              <figcaption className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {block.content.caption}
              </figcaption>
            )}
          </figure>
        );
      
      case 'video':
        return (
          <div className="aspect-video">
            {(block.content?.videoUrl || block.props?.url)?.includes('youtube.com') || (block.content?.videoUrl || block.props?.url)?.includes('youtu.be') ? (
              <iframe
                src={(block.content?.videoUrl || block.props?.url)?.replace('watch?v=', 'embed/')}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            ) : (
              <video 
                src={block.content?.videoUrl || block.props?.url} 
                controls 
                className="w-full h-full rounded-lg"
                poster={block.content?.thumbnail}
              />
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div className="space-y-2">
            {block.content?.title && <h3 className="font-semibold">{block.content.title}</h3>}
            <audio controls className="w-full">
              <source src={block.content?.audioUrl} />
            </audio>
          </div>
        );
      
      case 'embed':
        return (
          <div className="w-full">
            {block.content?.embedCode ? (
              <div dangerouslySetInnerHTML={{ __html: block.content.embedCode }} />
            ) : (
              <iframe
                src={block.content?.url}
                className="w-full min-h-[400px] rounded-lg"
                allowFullScreen
              />
            )}
          </div>
        );
      
      case 'pdf':
        return (
          <div className="space-y-2">
            {block.content?.title && <h3 className="font-semibold">{block.content.title}</h3>}
            <iframe
              src={block.content?.pdfUrl}
              className="w-full h-[500px] rounded-lg"
              title={block.content?.title}
            />
          </div>
        );
      
      case 'ad':
        return block.content?.code ? (
          <div dangerouslySetInnerHTML={{ __html: block.content.code }} />
        ) : (
          <a href={block.content?.link} target="_blank" rel="noopener noreferrer">
            <img src={block.content?.imageUrl} alt="Advertisement" className="w-full rounded-lg" />
          </a>
        );
      
      case 'affiliate':
        return (
          <div className="flex flex-col md:flex-row gap-6 items-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            {block.content?.productImage && (
              <img 
                src={block.content.productImage} 
                alt={block.content.productTitle}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">{block.content.productTitle}</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                {block.content.productPrice}
              </p>
              <a
                href={block.content.productLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition"
              >
                {block.content.buttonText || 'Buy Now'}
              </a>
            </div>
          </div>
        );
      
      case 'quote':
        return (
          <blockquote className="border-l-4 border-purple-500 pl-4 italic">
            <p>{block.props?.text}</p>
            {block.props?.author && <footer className="text-sm mt-2">— {block.props.author}</footer>}
          </blockquote>
        );
      
      case 'cta':
        return (
          <a href={block.props?.url} className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
            {block.props?.text}
          </a>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`${getPaddingClass(block.design?.padding)} ${getBorderRadiusClass(block.design?.borderRadius)} ${getAlignmentClass(block.design?.alignment)}`}
      style={blockStyle}
    >
      {renderBlockContent(block)}
    </div>
  );
};

export default BlockRenderer;