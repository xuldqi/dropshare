// ��̬�ļ������м��
app.use(express.static('public'));

// �������Ļ������ͷ��������Ԥ�����ļ�
app.get(/\.css$/, (req, res, next) => {
    // ���ڷ�ֹ��˸��CSS�ļ�����������Ļ������ͷ
    if (req.path.includes('noflash')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});

// ��������汾·��
