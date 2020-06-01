import traceback
from functools import wraps
from os.path import exists, sep
from os import getcwd, remove
import PIL.Image as image

import pymysql
from flask import Flask, request, jsonify, session
from requests import get
from DBUtils.PooledDB import PooledDB
from pymysql import escape_string
from werkzeug.datastructures import FileStorage

static_path = getcwd()+sep+"static"
# 数据库连接池
POOL = PooledDB(
    creator=pymysql,  # 使用链接数据库的模块
    maxconnections=10,  # 连接池允许的最大连接数，0和None表示不限制连接数
    mincached=2,  # 初始化时，链接池中至少创建的空闲的链接，0表示不创建


    maxcached=5,  # 链接池中最多闲置的链接，0和None不限制
    maxshared=3,  # 链接池中最多共享的链接数量，0和None表示全部共享。PS: 无用，因为pymysql和MySQLdb等模块的 threadsafety都为1，所有值无论设置为多少，_maxcached永远为0，所以永远是所有链接都共享。
    blocking=True,  # 连接池中如果没有可用连接后，是否阻塞等待。True，等待；False，不等待然后报错
    maxusage=None,  # 一个链接最多被重复使用的次数，None表示无限制
    setsession=[],  # 开始会话前执行的命令列表。如：["set datestyle to ...", "set time zone ..."]
    ping=0,
    # ping MySQL服务端，检查是否服务可用。
    # 如：0 = None = never, 1 = default = whenever it is requested, 2 = when a cursor is created, 4 = when a query is executed, 7 = always
    host='127.0.0.1',
    port=3306,
    user='root',
    password='1607439239',
    database='daywords',
    charset='utf8mb4'
)
# 给予conn连接
def with_con(func):
    @wraps(func)
    def inner(*args, **kwargs):
        # 给指定的函数加一个conn参数为数据库连接
        conn = POOL.connection()
        try:
            re = func(conn, *args, **kwargs)
        except Exception as e:
            traceback.print_exc()
            re = {'state': 'err', 'msg': str(e)}
        conn.close()
        return re
    return inner

app = Flask(__name__)
app.secret_key = 'adfASDGA|SAF@(*UMNRO{@'

@app.route('/get_openid', methods=['POST'])
@with_con
def get_openid(conn):
    re = get('https://api.weixin.qq.com/sns/jscode2session?'
             'appid=wx9b2f8966bc36c493'
             '&secret=63b56748d6e4689344e6b6964b3f57e0'
             '&js_code=' + eval(bytes.decode(request.data))['code'] +
             '&grant_type=authorization_code')
    openid = re.json()['openid']
    session['openid'] = openid
    # 新建用户
    cursor = conn.cursor()
    cursor.execute('select count(*) from act where openid="%s"' % openid)
    if not cursor.fetchone()[0]:
        cursor.execute('insert into act(openid, flws, subs, blks, prss) VALUES("%s", "[]", "[]", "[]", "[]")' % openid)
        conn.commit()
    return jsonify({'state': 'suc', 'openid': openid})

# 修改用户信息
@app.route('/alter_act', methods=['POST'])
@with_con
def alter_act(conn):
    try:
        paras = eval(bytes.decode(request.data))
        cursor = conn.cursor()
        cursor.execute('update act set where openid="%s"' % paras['openid'])
        cursor.commit()
        return jsonify({'state': 'suc'})
    except Exception as e:
        return jsonify({'state': 'err', 'msg': str(e)})

# 获取i界面信息
@app.route('/get_i_info', methods=['POST'])
@with_con
def get_i_info(conn):
    paras = eval(bytes.decode(request.data))
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute('select nm,sign,json_length(flws) as flws,json_length(blks) as blks,json_length(subs) as subs from act where openid="%s"' % paras['openid'])
    re = {"has_cov": exists(static_path+sep+"img"+sep+"cov"+sep+paras['openid']+'.jpeg')}
    re.update(cursor.fetchone())
    cursor.execute('select title,cont,color from words where openid="%s" and crt_time="%s"' % (paras['openid'], paras['time']))
    r = cursor.fetchone()
    if r:
        re.update(r)
    return jsonify({'state': 'suc', 'data': re})

# 修改个人信息
@app.route('/edit_info', methods=['POST'])
@with_con
def edit_info(conn):
    has_a = False
    try:
        paras = eval(bytes.decode(request.data))
    except:
        has_a = True
        paras = request.form
    cursor = conn.cursor()
    openid = paras['openid']
    cursor.execute('update act set nm="%s",sign="%s" where openid="%s"'
                   % (escape_string(paras['nm']), escape_string(paras['sign']), openid))
    if has_a:
        path = static_path+sep+'img'+sep+'cov'+sep+openid+'.jpeg'
        # 保存头像
        if exists(path):
            remove(path)
        img = image.open(request.files['avatar'])
        img.resize((300, 300)).save(open(path, 'wb'), 'jpeg')
    conn.commit()
    return jsonify({'state': 'suc'})

# 添加/修改一句
@app.route('/add_words', methods=['POST'])
@with_con
def add_words(conn):
    paras = eval(bytes.decode(request.data))
    cursor = conn.cursor()
    cursor.execute('select count(*) from words where openid="%s" and crt_time="%s"' % (paras['openid'], paras['time']))
    if not cursor.fetchone()[0]:
        # 添加
        cursor.execute('insert into words(openid, title, cont, crt_time, color, prs_num) VALUES("%s", "%s", "%s", "%s", %d, 0)'
                       % (paras['openid'], escape_string(paras['title']), escape_string(paras['content']), paras['time'], int(paras['color'])))
    else:
        # 修改
        cursor.execute('update words set title="%s",cont="%s",color=%d where openid="%s" and crt_time="%s"'
                       % (escape_string(paras['title']), escape_string(paras['content']), int(paras['color']), paras['openid'], paras['time']))
    conn.commit()
    return jsonify({'state': 'suc'})

# 获取home中的今日
@app.route('/get_today', methods=['POST'])
@with_con
def get_today(conn):
    paras = eval(bytes.decode(request.data))
    p, count, what, tm, openid = int(paras['p']), int(paras['count']), paras['what'], paras['time'], paras['openid']
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    if what == 'sub':
        re = {'lis': []}
        cursor.execute('select count(*) as c from words where crt_time="%s" and json_contains((select subs from act where act.openid="%s"), json_quote(words.openid), "$")'
                       % (tm, openid))
        re['count'] = cursor.fetchone()['c']
        cursor.execute('select json_extract(subs, "$[%d to %d]") as lis from act where openid="%s"'
                       % (p*count, count, openid))
        try:
            lis = eval(cursor.fetchone()['lis'])
        except:
            lis = []
        if lis:
            for i in lis:
                cursor.execute('select id,openid,title,color,prs_num from words where openid="%s" and crt_time="%s"'
                               % (i, tm))
                info = cursor.fetchone()
                if info:
                    re['lis'].append(info)
    else:
        re = {}
        cursor.execute('select count(*) as c from words where crt_time="%s"' % tm)
        re['count'] = cursor.fetchone()['c']
        cursor.execute('select id,openid,title,color,prs_num from words where crt_time="%s" limit %d,%d'
                       % (tm, p*count, count))
        re['lis'] = cursor.fetchall()
    return jsonify({'state': 'suc', 'data': re})

# 搜索
@app.route('/search', methods=['POST'])
@with_con
def search(conn):
    paras = eval(bytes.decode(request.data))
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    re, s, p, count = {}, escape_string(paras['s']), int(paras['p']), int(paras['count'])
    cursor.execute('select count(*) as c from %s where %s like "%s"'
                   % (paras['at'], ('title' if paras['at'] == 'words' else 'nm'), '%' + s + '%'))
    re['count'] = cursor.fetchone()['c']
    if paras['at'] == 'words':
        cursor.execute('select id,openid,title,color,prs_num,color,crt_time from words where title like "%s" order by id desc limit %d,%d'
                       % ('%'+s+'%', p*count, count))
    else:
        cursor.execute('select openid,nm,json_length(flws) as flws from act where nm like "%s" limit %d,%d'
                       % ('%'+s+'%', p*count, count))
    r = cursor.fetchall()
    re['lis'] = (r if r else [])
    return jsonify({'state': 'suc', 'data': re})

# 获取订阅/拉黑/粉丝列表
@app.route('/get_lis', methods=['POST'])
@with_con
def get_lis(conn):
    paras = eval(bytes.decode(request.data))
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    re, p, count = {'lis': []}, int(paras['p']), int(paras['count'])
    cursor.execute('select json_length(%s) as c from act where openid="%s"' % (paras['what'], paras['openid']))
    re['count'] = cursor.fetchone()['c']
    cursor.execute('select json_extract(%s, "$[%d to %d]") as lis from act where openid="%s"'
                   % (paras['what'], p*count, count, paras['openid']))
    r = eval(cursor.fetchone()['lis'])
    for i in r:
        cursor.execute('select openid,nm from act where openid="%s"' % i)
        r = cursor.fetchone()
        if r:
            re['lis'].append(r)
    return jsonify({'state': 'suc', 'data': re})

# 删除订阅/拉黑/粉丝列表
@app.route('/remove_lis', methods=['POST'])
@with_con
def remove_lis(conn):
    paras = eval(bytes.decode(request.data))
    what, openid, lis = paras['what'], paras['openid'], paras['ids']
    cursor = conn.cursor()
    cursor.execute('select %s from act where openid="%s"' % (what, openid))
    old_lis = eval(cursor.fetchone()[0])
    new_lis = []
    for i in old_lis:
        if i not in lis:
            new_lis.append(i)
    cursor.execute('update act set %s="%s" where openid="%s"' % (what, escape_string(str(new_lis).replace("'", '"')), openid))
    conn.commit()
    return jsonify({'state': 'suc'})

# 获取用户详情
@app.route('/get_userinfo', methods=['POST'])
@with_con
def get_userinfo(conn):
    paras = eval(bytes.decode(request.data))
    openid, u_id = paras['openid'], paras['u_id']
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute('select nm,sign from act where openid="%s"' % openid)
    re = cursor.fetchone()
    # 获取是否订阅拉黑
    if u_id:
        cursor.execute('select json_contains(subs, json_quote("%s"), "$") as has_sub from act where openid="%s"' % (openid, u_id))
        re.update(cursor.fetchone())
        cursor.execute('select json_contains(blks, json_quote("%s"), "$") as has_blk from act where openid="%s"' % (openid, u_id))
        re.update(cursor.fetchone())
    return jsonify({'state': 'suc', 'data': re})

# 获取用户句子列表
@app.route('/get_userwords_lis', methods=['POST'])
@with_con
def get_userwords_lis(conn):
    paras = eval(bytes.decode(request.data))
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    re, openid, p, count = {}, paras['openid'], int(paras['p']), int(paras['count'])
    cursor.execute('select count(*) as c from words where openid="%s"' % openid)
    re['count'] = cursor.fetchone()['c']
    cursor.execute('select id,title,cont,crt_time,color,prs_num,crt_time from words where openid="%s" order by id desc limit %d,%d'
                   % (openid, p*count, count))
    re['lis'] = cursor.fetchall()
    return jsonify({'state': 'suc', 'data': re})

# 获取句子详情
@app.route('/get_wordsinfo', methods=['POST'])
@with_con
def get_wordsinfo(conn):
    paras = eval(bytes.decode(request.data))
    id_ = int(paras['id'])
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute('select openid,title,cont,crt_time,color,prs_num from words where id=%d' % id_)
    re = cursor.fetchone()
    cursor.execute('select nm from act where openid="%s"' % re['openid'])
    re['nm'] = cursor.fetchone()['nm']
    cursor.execute('select json_contains(prss, json_quote("%d"), "$") as h from act where openid="%s"' % (id_, re['openid']))
    re['has_prs'] = cursor.fetchone()['h']
    return jsonify({'state': 'suc', 'data': re})

# 点赞/取消
@app.route('/tog_prs', methods=['POST'])
@with_con
def tog_prs(conn):
    paras = eval(bytes.decode(request.data))
    id_, openid, bo = int(paras['id']), paras['openid'], paras['bool']
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    if bo:
        cursor.execute('update act set prss=json_array_append(prss, "$", "%d") where openid="%s"' % (id_, openid))
    else:
        cursor.execute('select json_search(prss, "one", "%d") as p from act where openid="%s"' % (id_, openid))
        pt = cursor.fetchone()['p']
        if pt:
            cursor.execute('update act set prss=json_remove(prss, %s) where openid="%s"' % (pt, openid))
    cursor.execute('update words set prs_num=prs_num+%d where id=%d' % ((1 if bo else -1), id_))
    conn.commit()
    return jsonify({'state': 'suc'})

# 订阅/取消
@app.route('/tog_subblk', methods=['POST'])
@with_con
def tog_subblk(conn):
    paras = eval(bytes.decode(request.data))
    u_id, openid, bo, tp = paras['u_id'], paras['openid'], paras['bool'], paras['tp']
    other_tp = 'blks' if tp =='subs' else 'subs'
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    if bo:
        # 添加列表，另一个移除
        cursor.execute('update act set %s=json_array_append(%s, "$", "%s") where openid="%s"' % (tp, tp, openid, u_id))
        cursor.execute('select json_search(%s, "one", "%s") as p from act where openid="%s"' % (other_tp, openid, u_id))
        pt = cursor.fetchone()['p']
        if pt:
            cursor.execute('update act set %s=json_remove(%s, %s) where openid="%s"' % (other_tp, other_tp, pt, u_id))
        # other_id的粉丝列表添加/移除
        if tp == 'subs':
            cursor.execute('update act set flws=json_array_append(flws, "$", "%s") where openid="%s"' % (u_id, openid))
        else:
            cursor.execute('select json_search(flws, "one", "%s") as p from act where openid="%s"' % (u_id, openid))
            pt = cursor.fetchone()['p']
            if pt:
                cursor.execute('update act set flws=json_remove(flws, %s) where openid="%s"' % (pt, openid))
    else:
        cursor.execute('select json_search(%s, "one", "%s") as p from act where openid="%s"' % (tp, openid, u_id))
        pt = cursor.fetchone()['p']
        if pt:
            cursor.execute('update act set %s=json_remove(%s, %s) where openid="%s"' % (tp, tp, pt, u_id))
        # other_id的粉丝列表添加/移除
        if tp == 'subs':
            cursor.execute('select json_search(flws, "one", "%s") as p from act where openid="%s"' % (u_id, openid))
            pt = cursor.fetchone()['p']
            if pt:
                cursor.execute('update act set flws=json_remove(flws, %s) where openid="%s"' % (pt, openid))
    conn.commit()
    return jsonify({'state': 'suc'})

if __name__ == '__main__':
    app.run(host='0.0.0.0')
