/**
 * Converts a URL to a File object by fetching the resource.
 * @param url The URL of the resource to convert
 * @returns A Promise that resolves to a File object
 */
export const convertURLtoFile = async (url: string): Promise<File> => {
  const response = await fetch(url);
  const data = await response.blob();
  const filename = url.split('/').pop() || 'file';
  
  // Use the blob's actual MIME type if available, otherwise default to octet-stream
  const metadata = { type: data.type || 'application/octet-stream' };
  return new File([data], filename, metadata);
};
