---
layout: posts
title: Apache FtpServer 学习笔记
author: Robert Peng
category: Java
---

<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>

## 序

本学习笔记的内容基于 1.0.6 版本的 Apache FtpServer。

> Apache FtpServer 是完全由 Java 编写而成的 FTP 服务器，可单独作为 Windows 服务或 Unix/Linux 守护线程运行，也可以嵌入在 Java 应用程序中。

[这个](http://mina.apache.org/ftpserver-project/index.html)是 Apache FtpServer 的官方网站，而[这里](http://mina.apache.org/ftpserver-project/documentation.html)则是 Apache FtpServer 的官方文档目录。

本笔记假设读者已完整阅读 Apache FtpServer 给出的官方文档，对 FtpServer 的主要入口类和配置类进行源码解析，作为对官方文档的补充。

为了提高可读性，文中出现的所有源代码都进行了一定的删减和修改。文中会给出所有类的官方源代码文件的链接。

接下来是正文部分。

---

## FtpServer 接口和 DefaultFtpServer 实现

先从入口类 `FtpServer` 开始。（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/FtpServer.java;h=6f84e496600d17fefadb7cb6b116699ab430c7bd;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public interface FtpServer {
    void start() throws FtpException;
    void suspend();
    void resume();
    void stop();
    
    boolean isStopped();
    boolean isSuspended();
}
</pre>

接口类提供了几个控制和判断 `FtpServer` 运行状态的方法。可想而知，`FtpServer` 的配置应在实例化之前进行。

接下来看一下 `FtpServer` 的唯一实现类 `DefaultFtpServer`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/impl/DefaultFtpServer.java;h=680bd19a8471015094d9f525cab79ad6f6eed736;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class DefaultFtpServer implements FtpServer {
    private final Logger LOG = LoggerFactory.getLogger(DefaultFtpServer.class);

    private FtpServerContext serverContext;

    private boolean suspended = false;
    private boolean started = false;

    /**
     * Internal constructor, do not use directly. Use {@link FtpServerFactory} instead
     */
    public DefaultFtpServer(final FtpServerContext serverContext) {
        this.serverContext = serverContext;
    }

    ...

}
</pre>

`DefaultFtpServer` 除了两个标记当前运行状态的标识位 `suspended` 和 `started` 以外，值得注意的成员变量只有一个 `FtpServerContext`，可想而知这个变量包含的是 `DefaultFtpServer` 的配置信息。`DefaultFtpServer` 唯一的构造器被 JavaDoc 声明为内部使用，用户应通过 `FtpServerFactory` 来创建 `DefaultFtpServer` 实例。该构造器则接受了传入的 `FtpServerContext`。可想而知，使用 `FtpServerFactory` 时，`FtpServerFactory` 内部会维持一个 `FtpServerContext` 实例，并在构建 `DefaultFtpServer` 时传入构造器。

<pre class="brush: java">
public class DefaultFtpServer implements FtpServer {
	...

	/**
     * Start the server. Open a new listener thread.
     * @throws FtpException 
     */
    public void start() throws FtpException {
        if (serverContext == null) {
            // we have already been stopped, can not be restarted
            throw new IllegalStateException("FtpServer has been stopped. Restart is not supported");
        }

        List&lt;Listener> startedListeners = new ArrayList&lt;Listener>();
        
        try {
            Map&lt;String, Listener> listeners = serverContext.getListeners();
            for (Listener listener : listeners.values()) {
                listener.start(serverContext);
                startedListeners.add(listener);
            }
    
            // init the Ftplet container
            serverContext.getFtpletContainer().init(serverContext);
        
            started = true;

            LOG.info("FTP server started");
        } catch(Exception e) {
            ...
        }
    }

    ...

}
</pre>

可以看到，`DefaultFtpServer` 的 `start` 方法启动了 `FtpServerContext` 里的所有 `Listener` 和 `Fptlet`。

<pre class="brush: java">
public class DefaultFtpServer implements FtpServer {
	...

	/**
     * Stop the server. Stopping the server will close completely and 
     * it not supported to restart using {@link #start()}.
     */
    public void stop() {
        if (serverContext == null) {
            // we have already been stopped, ignore
            return;
        }

        // stop all listeners
        Map&lt;String, Listener> listeners = serverContext.getListeners();
        for (Listener listener : listeners.values()) {
            listener.stop();
        }

        // destroy the Ftplet container
        serverContext.getFtpletContainer().destroy();

        // release server resources
        if (serverContext != null) {
            serverContext.dispose();
            serverContext = null;
        }

        started = false;
    }

    ...

}
</pre>

可以看到，`DefaultFtpServer` 在停止时会停止所有的 `Listener` 和 `Ftplet`，并弃用（dispose）其所拥有的 `FtpServerContext`。

<pre class="brush: java">
public class DefaultFtpServer implements FtpServer {
	...

	/**
     * Suspend further requests
     */
    public void suspend() {
        if (!started) {
            return;
        }

        LOG.debug("Suspending server");
        // stop all listeners
        Map&lt;String, Listener> listeners = serverContext.getListeners();
        for (Listener listener : listeners.values()) {
            listener.suspend();
        }

        suspended = true;
        LOG.debug("Server suspended");
    }

    /**
     * Resume the server handler
     */
    public void resume() {
        if (!suspended) {
            return;
        }

        LOG.debug("Resuming server");
        Map&lt;String, Listener> listeners = serverContext.getListeners();
        for (Listener listener : listeners.values()) {
            listener.resume();
        }

        suspended = false;
        LOG.debug("Server resumed");
    }

    ...
}
</pre>

可以看到，`DefaultFtpServer` 的 `suspend` 和 `resume` 实际上就只是对 `Listener` 的暂停和恢复。

那么 `DefaultFtpServer` 的行为不妨总结如下：

<table class="table">
	<tr>
		<th>方法</th>
		<th>行为</th>
	</tr>
	<tr>
		<td><code>start</code></td>
		<td>
			<ol>
				<li>启动（<code>start</code>） <code>FtpServerContext</code> 中的所有 <code>Listener</code></li>
				<li>初始化（<code>init</code>） <code>FtpServerContext</code> 中的 <code>FtpletContainer</code></li>
			</ol>
		</td>
	</tr>
	<tr>
		<td><code>stop</code></td>
		<td>
			<ol>
				<li>停止（<code>stop</code>）<code>FtpServerContext</code> 中的所有 <code>Listener</code></li>
				<li>摧毁（<code>destroy</code>）<code>FtpServerContext</code> 中的 <code>FtpletContainer</code></li>
				<li>弃用（<code>dispose</code>）其 <code>FtpServerContext</code></li>
			</ol>
		</td>
	</tr>
	<tr>
		<td><code>suspend</code></td>
		<td>暂停（<code>suspend</code>）<code>FtpServerContext</code> 中的所有 <code>Listener</code></td>
	</tr>
	<tr>
		<td><code>resume</code></td>
		<td>恢复（<code>resume</code>）<code>FtpServerContext</code> 中的所有 <code>Listener</code></td>
	</tr>
</table>

## FtpServerFactory 和 DefaultFtpServerContext

先来看用于构建 `DefaultFtpServer` 的 `FtpServerFactory`: （[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/FtpServerFactory.java;h=cac1aa8ba1caf24ad35553158334e30e20125a50;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class FtpServerFactory {

    private DefaultFtpServerContext serverContext;

    /**
     * Creates a server with the default configuration
     * 
     * @throws Exception
     */
    public FtpServerFactory() {
        serverContext = new DefaultFtpServerContext();
    }

    /**
     * Create a {@link DefaultFtpServer} instance based
     *   on the provided configuration
     * @return The {@link DefaultFtpServer} instance
     */
    public FtpServer createServer() {
        return new DefaultFtpServer(serverContext);
    }

    ...

}
</pre>

可见，`FtpServerFactory` 确实维护着一个 `DefaultFtpServerContext` 实例，并在 `createServer` 方法被调用时使用该 `FtpServerContext` 创建了 `DefaultFtpServer` 实例。`FtpServerFactory` 剩余的配置方法实际上都会直接将配置逻辑委托给其 `DefaultFtpServerContext` 成员，因此我们可以直接开始看 `DefaultFtpServerContext`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/impl/DefaultFtpServerContext.java;h=731b0f581da796f3a5a9eb54eff00038722dc33d;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {
    ...
}
</pre>

可以看到，`DefaultFtpServerContext` 实现了接口 `FtpServerContext`。那么我们先看一下 `FtpServerContext`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/impl/FtpServerContext.java;h=a5eb1459b23994570c140fc425623de10a498691;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public interface FtpServerContext extends FtpletContext {

    ConnectionConfig getConnectionConfig();
    
    MessageResource getMessageResource();

    FtpletContainer getFtpletContainer();

    Listener getListener(String name);
    Map&lt;String, Listener> getListeners();

    CommandFactory getCommandFactory();
    
    ThreadPoolExecutor getThreadPoolExecutor();

    /**
     * Release all components.
     */
    void dispose();
}
</pre>

我们再来看 `FtpServerContext` 扩展的 `FtpletContext`：

<pre class="brush: java">
public interface FtpletContext {
    UserManager getUserManager();

    FileSystemFactory getFileSystemManager();

    FtpStatistics getFtpStatistics();

    Ftplet getFtplet(String name);
}
</pre>

那么，至此我们就可以总结出，一个 `FtpServerContext` 包含如下几个组件（Component）：

<table class="table">
	<tr>
		<th>类型</th>
        <th>说明</th>
	</tr>
	<tr>
		<td><code>ConnectionConfig</code></td>
		<td></td>
	</tr>
	<tr>
		<td><code>MessageResource</code></td>
		<td></td>
	</tr>
	<tr>
		<td><code>FtpletContainer</code></td>
		<td><code>Ftplet</code> 以键值对的形式注册到其中</td>
	</tr>
	<tr>
		<td><code>CommandFactory</code></td>
		<td></td>
	</tr>
	<tr>
		<td><code>UserManager</code></td>
		<td></td>
	</tr>
	<tr>
		<td><code>FileSystemFactory</code></td>
		<td></td>
	</tr>
	<tr>
		<td><code>FtpStatistics</code></td>
		<td></td>
	</tr>
	<tr>
		<td><code>ThreadPoolExecutor</code></td>
		<td>一个后续用于 FTP 服务器执行监听逻辑的线程池</td>
	</tr>
	<tr>
		<td><code>Listener</code></td>
		<td>以名称（<code>String</code>）为键注册到 <code>FtpServerContext</code> 中的若干个监听器</td>
	</tr>
	<tr>
		<td><code>Ftplet</code></td>
		<td>与 <code>Listener</code> 们类似，以名称（<code>String</code>）为键注册到 <code>FtpletContainer</code> 中</td>
	</tr>
</table>

同时，我们也看到，`FtpServerContext` 中除了声明了各个组件对应的 Getter 方法以外，也声明了一个 `dispose` 方法，可用于释放 `FtpServerContext` 所包含的所有组件。

那么我们再回过头来看一下 `DefaultFtpServerContext`：

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {
    private final Logger LOG = LoggerFactory.getLogger(DefaultFtpServerContext.class);

    private MessageResource messageResource = new MessageResourceFactory().createMessageResource();
    private UserManager userManager = new PropertiesUserManagerFactory().createUserManager();
    private FileSystemFactory fileSystemManager = new NativeFileSystemFactory();
    private FtpletContainer ftpletContainer = new DefaultFtpletContainer();
    private FtpStatistics statistics = new DefaultFtpStatistics();
    private CommandFactory commandFactory = new CommandFactoryFactory().createCommandFactory();
    private ConnectionConfig connectionConfig = new ConnectionConfigFactory().createConnectionConfig();
    private Map&lt;String, Listener> listeners = new HashMap&lt;String, Listener>();

	...

	public DefaultFtpServerContext() {
        // create the default listener
        listeners.put("default", new ListenerFactory().createListener());
    }

    ...

}
</pre>

这里我们看到，`DefaultFtpServerContext` 在实例化时为每一个组件都赋予了默认值，其中也创建了一个名为 `default` 的默认 `Listener`。

我们继续往下看：

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {
	...

	public ConnectionConfig getConnectionConfig() { ... }
	public void setConnectionConfig(ConnectionConfig connectionConfig) { ... }

	public UserManager getUserManager() { ... }
	public void setUserManager(UserManager userManager) { ... }

	public FileSystemFactory getFileSystemManager() { ... }
	public void setFileSystemManager(FileSystemFactory fileSystemManager) { ... }

    public MessageResource getMessageResource() { ... }
    public void setMessageResource(MessageResource messageResource) { ... }

    public FtpletContainer getFtpletContainer() { ... }
    public void setFtpletContainer(FtpletContainer ftpletContainer) { ... }
    public Ftplet getFtplet(String name) { ... }

    public Map&lt;String, Listener> getListeners() { ... }
    public void setListeners(Map&lt;String, Listener> listeners) { ... }
    public Listener getListener(String name) { ... }
    public void setListener(String name, Listener listener) { ... }
    public void addListener(String name, Listener listener) { ... }
    public Listener removeListener(String name) { ... }

    public FtpStatistics getFtpStatistics() { ... }
    public void setFtpStatistics(FtpStatistics statistics) { ... }

	public CommandFactory getCommandFactory() { ... }
    public void setCommandFactory(CommandFactory commandFactory) { ... }

    ...

}
</pre>

意料之中，`DefaultFtpServerContext` 实现了每个组件对应的 Getter 和 Setter 方法。除此之外，`DefaultFtpServerContext` 还应包含一个 `ThreadPoolExecutor` 组件：

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {
	
	...

	/**
     * The thread pool executor to be used by the server using this context
     */
    private ThreadPoolExecutor threadPoolExecutor = null;

    ...

    public synchronized ThreadPoolExecutor getThreadPoolExecutor() {
        if(threadPoolExecutor == null) {
            int maxThreads = connectionConfig.getMaxThreads();
            if (maxThreads &lt; 1) {
                int maxLogins = connectionConfig.getMaxLogins();
                if(maxLogins > 0) {
                    maxThreads = maxLogins;
                }
                else {
                    maxThreads = 16;
                }
            }
            LOG.debug("Intializing shared thread pool executor with max threads of {}", maxThreads);
            threadPoolExecutor = new OrderedThreadPoolExecutor(maxThreads);
        }
        return threadPoolExecutor;
    }
}
</pre>

可见，这个 `ThreadPoolExecutor` 的实例化是 lazy 的。它会根据 `ConnectionConfig` 中设定的 `maxThreads` 和 `maxLogins` 值来设定自己的线程数，并实例化为 `OrderedThreadPoolExecutor` 类型。

实际上，`DefaultFtpServerContext` 还包含两个静态成员变量和一个 `createDefaultUsers` 方法：

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {

	...

	private static final List&lt;Authority> ADMIN_AUTHORITIES = new ArrayList&lt;Authority>();
    private static final List&lt;Authority> ANON_AUTHORITIES = new ArrayList&lt;Authority>();

    ...

    static {
        ADMIN_AUTHORITIES.add(new WritePermission());
        
        ANON_AUTHORITIES.add(new ConcurrentLoginPermission(20, 2));
        ANON_AUTHORITIES.add(new TransferRatePermission(4800, 4800));
    }

    ...

    /**
     * Create default users.
     */
    public void createDefaultUsers() throws Exception {
        UserManager userManager = getUserManager();

        // create admin user
        String adminName = userManager.getAdminName();
        if (!userManager.doesExist(adminName)) {
            LOG.info("Creating user : " + adminName);
            BaseUser adminUser = new BaseUser();
            adminUser.setName(adminName);
            adminUser.setPassword(adminName);
            adminUser.setEnabled(true);

            adminUser.setAuthorities(ADMIN_AUTHORITIES);

            adminUser.setHomeDirectory("./res/home");
            adminUser.setMaxIdleTime(0);
            userManager.save(adminUser);
        }

        // create anonymous user
        if (!userManager.doesExist("anonymous")) {
            LOG.info("Creating user : anonymous");
            BaseUser anonUser = new BaseUser();
            anonUser.setName("anonymous");
            anonUser.setPassword("");

            anonUser.setAuthorities(ANON_AUTHORITIES);

            anonUser.setEnabled(true);

            anonUser.setHomeDirectory("./res/home");
            anonUser.setMaxIdleTime(300);
            userManager.save(anonUser);
        }
    }

    ...

}
</pre>

可见，这里是默认配置了管理员账户和匿名账户的权限，并向 `UserManager` 中注册了这两个默认存在的账户。同样由此可见，`UserManager` 负责管理所有账户的用户名和密码等登录信息、权限信息以及它们的连接等待时长、Home 路径等配置信息。

这里我们不妨根据我们获取到的信息来丰富一下上面出现过的 `FtpServerContext` 组件表：

<table class="table">
	<tr>
		<th>类型</th>
        <th>说明</th>
        <th>默认实例化方式</th>
	</tr>
	<tr>
		<td><code>ConnectionConfig</code></td>
		<td>包含 `maxThreads` 和 `maxLogins` 两个配置值，用于控制 FTP 服务器所使用的线程数</td>
		<td><code>new ConnectionConfigFactory().createConnectionConfig();</code></td>
	</tr>
	<tr>
		<td><code>MessageResource</code></td>
		<td></td>
		<td><code>new MessageResourceFactory().createMessageResource();</code></td>
	</tr>
	<tr>
		<td><code>FtpletContainer</code></td>
		<td><code>Ftplet</code> 以键值对的形式注册到其中</td>
		<td><code>new DefaultFtpletContainer();</code></td>
	</tr>
	<tr>
		<td><code>CommandFactory</code></td>
		<td></td>
		<td><code>new CommandFactoryFactory().createCommandFactory();</code></td>
	</tr>
	<tr>
		<td><code>UserManager</code></td>
		<td>负责管理服务器的用户信息，包括他们的登录信息、权限信息和配置信息</td>
		<td><code>new PropertiesUserManagerFactory().createUserManager();</code></td>
	</tr>
	<tr>
		<td><code>FileSystemFactory</code></td>
		<td></td>
		<td><code>new NativeFileSystemFactory();</code></td>
	</tr>
	<tr>
		<td><code>FtpStatistics</code></td>
		<td></td>
		<td><code>new DefaultFtpStatistics();</code></td>
	</tr>
	<tr>
		<td><code>ThreadPoolExecutor</code></td>
		<td>一个后续用于 FTP 服务器执行监听逻辑的线程池</td>
		<td>根据 <code>ConnectionConfig</code> 中配置的 <code>maxThreads</code> 和 <code>maxLogins</code> 值来确定实际使用的线程数，并实例化为 <code>OrderedThreadPoolExecutor</code></td>
	</tr>
	<tr>
		<td><code>Listener</code></td>
		<td>以名称（<code>String</code>）为键注册到 <code>FtpServerContext</code> 中的若干个监听器</td>
		<td>默认只注册了一个名为 <code>default</code> 的监听器</td>
	</tr>
	<tr>
		<td><code>Ftplet</code></td>
		<td>与 <code>Listener</code> 们类似，以名称（<code>String</code>）为键注册到 <code>FtpletContainer</code> 中</td>
		<td>默认不存在任何 <code>Ftplet</code></td>
	</tr>
</table>