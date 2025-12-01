This attribute tells the browser to download the file instead of navigating to it.

Important Note for Deployment: Since this is a "Cloud Resume Challenge" project, you are likely hosting this on AWS S3. While the HTML download attribute works in most cases, S3 configuration is the ultimate authority.

To guarantee the file downloads (instead of opening in Chrome/Edge PDF viewer) when hosted on S3, you should ensure the file metadata in S3 is set to:

Key: Content-Disposition
Value: attachment; filename="Macadaeg_Updated_CV.pdf"
If you are uploading via the AWS Console or CLI, make sure to set this metadata property on the PDF file itself. This overrides any browser preference to "preview" the file.