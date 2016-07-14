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

我们再来看 `FtpServerContext` 扩展的 `FtpletContext`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=ftplet-api/src/main/java/org/apache/ftpserver/ftplet/FtpletContext.java;h=afe1742b2a09eb9b644bac5ab12c462480c00899;hb=refs/heads/1.0.6)）

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

## Listener 和 ListenerFactory

之前我们提到，`DefaultFtpServer` 的 `start` 等运行状态转移方法，实际上就是在对其 `FtpServerContext` 里的 `Listener` 和 `Ftplet` 进行启动和关闭，那么这一节我们先从 `Listener` 看起。

从 Apache FtpServer 的[官方文档](http://mina.apache.org/ftpserver-project/configuration_listeners.html)我们可以得知：

> Listeners are the component in FtpServer which is responsible for listening on the network socket and when clients connect create the user session, execute commands and so on.

也就是说，`Listener` 组件负责监听网络端口，并在客户端连接至服务器时创建用户会话，并为用户执行命令。

话不多说，我们直接开始看 `Listener` 的代码吧：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/listener/Listener.java;h=c078982fe1deff5e6a576a3b80e4eebb103c4c72;hb=refs/heads/1.0.6)）

<pre class="brush: java">
/**
 * Interface for the component responsible for waiting for incoming socket
 * requests and kicking off {@link FtpIoSession}s
 */
public interface Listener {

    void start(FtpServerContext serverContext);
    void stop();
    void suspend();
    void resume();

    boolean isStopped();
    boolean isSuspended();

    Set&lt;FtpIoSession> getActiveSessions();

    DataConnectionConfiguration getDataConnectionConfiguration();
    String getServerAddress();
    int getPort();
    int getIdleTimeout();

    boolean isImplicitSsl();
    SslConfiguration getSslConfiguration();

    IpFilter getIpFilter();

    @Deprecated
    List&lt;InetAddress> getBlockedAddresses();
    @Deprecated
    List&lt;Subnet> getBlockedSubnets();
}
</pre>

这里可以看到，除了几个我们已知的状态转移方法和状态判断方法外，一个 `Listener` 基本的配置信息还包括了它所绑定的本地主机名以及端口号、连接超时时间和一个 `DataConnectionConfiguration`，也就是数据连接的配置信息、一个用于对部分 IP 的请求进行屏蔽的 `IpFilter`，以及 `SslConfiguration` 等 SSL 连接的相关配置。

除此之外我们还看到了两个已经被标记为 `@Deprecated` 的方法。它们同样是用于对来自某些 IP 的请求进行屏蔽的，已经被 `IpFilter` 所替代。在后面的代码中我们还会见到它们的身影，但本笔记只会关注 `IpFilter`，这两个域的相关内容将被跳过。

回忆之前看到的 `DefaultFtpServerContext`，`Listener` 在其实例化时默认是这样设置的：

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {

    ...

    private Map&lt;String, Listener> listeners = new HashMap&lt;String, Listener>();

    ...

    public DefaultFtpServerContext() {
        // create the default listener
        listeners.put("default", new ListenerFactory().createListener());
    }

    ...

}
</pre>

那么我们接下来就来看看 `ListenerFactory`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/listener/ListenerFactory.java;h=1a3532b6c6770b61dbeb04d34649ba61d7c7feb5;hb=refs/heads/1.0.6)）

<pre class="brush: java">
/**
 * Factory for listeners. Listeners themselves are immutable and must be 
 * created using this factory.
 */
public class ListenerFactory {

    private String serverAddress;
    private int port = 21;

    private SslConfiguration ssl;
    private boolean implicitSsl = false;

    private DataConnectionConfiguration dataConnectionConfig =
        new DataConnectionConfigurationFactory().createDataConnectionConfiguration();

    private int idleTimeout = 300;

    private List&lt;InetAddress> blockedAddresses;
    private List&lt;Subnet> blockedSubnets;
    
    /**
     * The IP filter
     */
    private IpFilter ipFilter = null;

    ...

}
</pre>

这里我们了解到，`Listener` 是不可变的，对 `Listener` 的配置需要通过 `ListenerFactory` 进行。由此，我们也能在 `ListenerFactory` 中看到先前提到的几个 `Listener` 的成员域了。

继续往下看：

<pre class="brush: java">
public class ListenerFactory {
    
    ...

    /**
     * Create a listener based on the settings of this factory. The listener is immutable.
     * @return The created listener
     */
    public Listener createListener() {
        try {
            InetAddress.getByName(serverAddress);
        } catch(UnknownHostException e) {
            throw new FtpServerConfigurationException("Unknown host",e);
        }
        // Deal with the old style black list and new IP Filter here. 
        if (ipFilter != null) {
            if (blockedAddresses != null || blockedSubnets != null) {
                throw new IllegalStateException("Usage of IPFilter in combination with blockedAddesses/subnets is not supported. ");
            }
        }
        if (blockedAddresses != null || blockedSubnets != null) {
            return new NioListener(serverAddress, port, implicitSsl, ssl,
                dataConnectionConfig, idleTimeout, blockedAddresses, blockedSubnets);
        }
        else {
            return new NioListener(serverAddress, port, implicitSsl, ssl,
                dataConnectionConfig, idleTimeout, ipFilter);
        }
    }

    ...

}
</pre>

可以看到，`ListenerFactory` 创建 `Listener` 的行为，主要包括了对所设定主机名的解析以判断该主机名可用，而后便使用了 `ListenerFactory` 内部设定的成员域创建出一个 `NioListener`。

继续往下看：

<pre class="brush: java">
public class ListenerFactory {
    
    ...

    public boolean isImplicitSsl() { ... }
    public void setImplicitSsl(boolean implicitSsl) { ... }

    public int getPort() { ... }
    public void setPort(int port) { ... }

    public String getServerAddress() { ... }
    public void setServerAddress(String serverAddress) { ... }

    public SslConfiguration getSslConfiguration() { ... }
    public void setSslConfiguration(SslConfiguration ssl) { ... }

    public DataConnectionConfiguration getDataConnectionConfiguration() { ... }
    public void setDataConnectionConfiguration(DataConnectionConfiguration dataConnectionConfig) { ... }

    public int getIdleTimeout() { ... }
    public void setIdleTimeout(int idleTimeout) { ... }

    public IpFilter getIpFilter() { ... }
    public void setIpFilter(IpFilter ipFilter) { ... }

    ...

}
</pre>

很好，后面就只是各个域的 Getter 和 Setter 方法了。这个类就算是看完了。

我们接着来看 `NioListener`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/listener/nio/NioListener.java;h=9161403993f058ffeb941c74f9bf3f2671d572eb;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class NioListener extends AbstractListener {

    private FtpServerContext context;
    private SocketAcceptor acceptor;
    private FtpHandler handler = new DefaultFtpHandler();

    ...

    public synchronized void start(FtpServerContext context) {
        ...
        
        try {
            
            this.context = context;
    
            acceptor = new NioSocketAcceptor(Runtime.getRuntime().availableProcessors());
    
            // 对 acceptor 进行设置
            ...
    
            handler.init(context, this);
            acceptor.setHandler(new FtpHandlerAdapter(context, handler));
    
            try {
                acceptor.bind(address);
            } catch (IOException e) { ... }
            
            updatePort();
    
        } catch(RuntimeException e) { ... }
    }

    ...

}
</pre>

我们可以看到，`NioListener` 的 `start` 方法实例化了一个 `NioSocketAcceptor`：它实现了 `SocketAcceptor` 接口，而这是 Apache Mina 框架的东西，这里我们不看。

值得注意的是，`NioListener` 还包含一个 `FtpHandler` 变量 `handler`，它被实例化为了 `DefaultFtpHandler`，并被放入了 `NioListener` 启动时传入的 `FtpServerContext`。而后 `handler` 被封装成一个 `FtpHandlerAdapter` 放入到了 `acceptor` 中。实际上，`FtpHandler` 和 `FtpServerContext` 一样，是属于 Apache FtpServer 框架特有的东西，那么这个 `FtpHandlerAdapter` 很明显就是使用的适配器模式了。至少这样我们就知道了，`NioListener` 需要利用这个 `DefaultFtpHandler` 来使用 `FtpServerContext` 中的其他组件。

## FtpHandler

在上一节中我们了解到，Apache FtpServer 默认使用的 `NioListener` 是通过 `FtpHandler` 来使用 `FtpServerContext` 中的其他组件的。

那么我们来看 `FtpHandler`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/impl/FtpHandler.java;h=69e1c2e76ae7ca18f4534459af24542f574cbbc0;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public interface FtpHandler {

    void init(FtpServerContext context, Listener listener);

    void sessionCreated(FtpIoSession session) throws Exception;
    void sessionOpened(FtpIoSession session) throws Exception;
    void sessionClosed(FtpIoSession session) throws Exception;
    void sessionIdle(FtpIoSession session, IdleStatus status) throws Exception;
    void exceptionCaught(FtpIoSession session, Throwable cause) throws Exception;
    void messageReceived(FtpIoSession session, FtpRequest request) throws Exception;
    void messageSent(FtpIoSession session, FtpReply reply) throws Exception;
}
</pre>

从方法名就能很容易看出来，这个所谓的 `FtpHandler` 实际上是一个 Event Handler（事件处理器）：除了 `init` 方法用于初始化 `FtpHandler`，其他方法的调用均意味着对应事件的发生。

我们接着来看 `DefaultFtpHandler`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/impl/DefaultFtpHandler.java;h=bd66ab2d00bc3d0b3070235866d289c1a7c2defd;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class DefaultFtpHandler implements FtpHandler {
    ...
    
    private FtpServerContext context;
    private Listener listener;

    public void init(final FtpServerContext context, final Listener listener) {
        this.context = context;
        this.listener = listener;
    }

    public void sessionCreated(final FtpIoSession session) throws Exception {
        session.setListener(listener);
        
        ServerFtpStatistics stats = ((ServerFtpStatistics) context
                .getFtpStatistics());

        if (stats != null) {
            stats.setOpenConnection(session);
        }
    }

    ...
}
</pre>

这里我们看到，`sessionCreated` 方法调用了 `FtpStatistics` 组件的 `setOpenConnection` 方法。

继续往下：

<pre class="brush: java">
public class DefaultFtpHandler implements FtpHandler {
    ...

    public void sessionOpened(final FtpIoSession session) throws Exception {
        FtpletContainer ftplets = context.getFtpletContainer();

        FtpletResult ftpletRet;
        try {
            ftpletRet = ftplets.onConnect(session.getFtpletSession());
        } catch (Exception e) {
            LOG.debug("Ftplet threw exception", e);
            ftpletRet = FtpletResult.DISCONNECT;
        }
        if (ftpletRet == FtpletResult.DISCONNECT) {
            LOG.debug("Ftplet returned DISCONNECT, session will be closed");
            session.close(false).awaitUninterruptibly(10000);
        } else {
            session.updateLastAccessTime();
            
            session.write(LocalizedFtpReply.translate(session, null, context,
                    FtpReply.REPLY_220_SERVICE_READY, null, null));
        }
    }

    ...
}
</pre>

`sessionOpened` 方法调用了 `FtpletContainer` 的 `onConnect` 方法，并会在 `Ftplet` 们示意应关闭 Session 时关闭掉该 Session。

继续往下：

<pre class="brush: java">
public class DefaultFtpHandler implements FtpHandler {
    ...

    public void sessionClosed(final FtpIoSession session) throws Exception {
        LOG.debug("Closing session");
        try {
            context.getFtpletContainer().onDisconnect(session.getFtpletSession());
        } catch (Exception e) { ... }

        // make sure we close the data connection if it happens to be open
        try {
            ServerDataConnectionFactory dc = session.getDataConnection(); 
            if(dc != null)
                dc.closeDataConnection();
        } catch (Exception e) { ... }
        
        FileSystemView fs = session.getFileSystemView();
        if(fs != null) {
            try  {
                fs.dispose();
            } catch (Exception e) { ... }
        }

        ServerFtpStatistics stats = ((ServerFtpStatistics) context.getFtpStatistics());

        if (stats != null) {
            stats.setLogout(session);
            stats.setCloseConnection(session);
            LOG.debug("Statistics login and connection count decreased due to session close");
        } else {
            LOG.warn("Statistics not available in session, can not decrease login and connection count");
        }
        LOG.debug("Session closed");
    }

    ...
}
</pre>

`sessionClosed` 被调用时，`FtpletContainer` 的 `onDisconnect` 事件方法被调用，而后关闭了 Session 对应的数据连接和用户的 `FileSystemView`（将在后面的章节中解释），并向 `FtpStatistics` 记录了这一行为。

继续往下：

<pre class="brush: java">
public class DefaultFtpHandler implements FtpHandler {
    ...

    public void messageReceived(final FtpIoSession session, final FtpRequest request) throws Exception {
        try {
            session.updateLastAccessTime();
            
            String commandName = request.getCommand();
            CommandFactory commandFactory = context.getCommandFactory();
            Command command = commandFactory.getCommand(commandName);

            // make sure the user is authenticated before he issues commands
            if (!session.isLoggedIn() && !isCommandOkWithoutAuthentication(commandName)) {
                session.write(LocalizedFtpReply.translate(session, request,
                        context, FtpReply.REPLY_530_NOT_LOGGED_IN,
                        "permission", null));
                return;
            }

            FtpletContainer ftplets = context.getFtpletContainer();

            FtpletResult ftpletRet;
            try {
                ftpletRet = ftplets.beforeCommand(session.getFtpletSession(), request);
            } catch (Exception e) {
                LOG.debug("Ftplet container threw exception", e);
                ftpletRet = FtpletResult.DISCONNECT;
            }
            if (ftpletRet == FtpletResult.DISCONNECT) {
                LOG.debug("Ftplet returned DISCONNECT, session will be closed");
                session.close(false).awaitUninterruptibly(10000);
                return;
            } else if (ftpletRet != FtpletResult.SKIP) {
                if (command != null) {
                    synchronized (session) {
                        command.execute(session, context, request);
                    }
                } else {
                    session.write(LocalizedFtpReply.translate(session, request,
                            context,
                            FtpReply.REPLY_502_COMMAND_NOT_IMPLEMENTED,
                            "not.implemented", null));
                }

                try {
                    ftpletRet = ftplets.afterCommand(session.getFtpletSession(),
                                                     request, session.getLastReply());
                } catch (Exception e) {
                    LOG.debug("Ftplet container threw exception", e);
                    ftpletRet = FtpletResult.DISCONNECT;
                }
                if (ftpletRet == FtpletResult.DISCONNECT) {
                    LOG.debug("Ftplet returned DISCONNECT, session will be closed");

                    session.close(false).awaitUninterruptibly(10000);
                    return;
                }
            }

        } catch (Exception ex) {
            // send error reply
            try {
                session.write(LocalizedFtpReply.translate(session, request,
                        context, FtpReply.REPLY_550_REQUESTED_ACTION_NOT_TAKEN,
                        null, null));
            } catch (Exception ex1) {}

            if (ex instanceof java.io.IOException) {
                throw (IOException) ex;
            } else {
                LOG.warn("RequestHandler.service()", ex);
            }
        }

    }

    ...
}
</pre>

这里我们看到，`messageReceived` 方法利用传入的 `FtpRequest` 变量的 `command` 域，从 `FtpServerContext` 的 `CommandFactory` 组件中拿到了一个 `Command` 对象，并在进行一定的验证后通过调用 `Command` 对象的 `execute` 方法来执行该命令。这里我们就了解到 `CommandFactory` 的基本作用了。

在阅读完 `DefaultFtpHandler` 的源代码以后，我们对 `FtpServerContext` 里的几个组件有了新的认识。这里我们就可以把之前出现过的总结表写成如下这个样子：

<table class="table">
    <tr>
        <th>类型</th>
        <th>说明</th>
    </tr>
    <tr>
        <td><code>ConnectionConfig</code></td>
        <td>包含 `maxThreads` 和 `maxLogins` 两个配置值，用于控制 FTP 服务器所使用的线程数</td>
    </tr>
    <tr>
        <td><code>MessageResource</code></td>
        <td></td>
    </tr>
    <tr>
        <td><code>FtpletContainer</code></td>
        <td><code>Ftplet</code> 以键值对的形式注册到其中。在特定事件发生时，<code>FtpletContainer</code> 对应的事件方法会被调用，其返回的 <code>FtpletResult</code> 结果可以指示服务器对事件作何响应</td>
    </tr>
    <tr>
        <td><code>CommandFactory</code></td>
        <td>在客户端发来请求时被调用，根据客户请求的 <code>command</code> 内容（字符串）返回对应的可执行的 <code>Command</code> 对象</td>
    </tr>
    <tr>
        <td><code>UserManager</code></td>
        <td>负责管理服务器的用户信息，包括他们的登录信息、权限信息和配置信息</td>
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

## UserManager

`UserManager` 是我们之前提到的 `FtpServerContext` 的内部组件之一。在 `DefaultFtpServerContext` 中，`UserManager` 组件默认的初始化语句为：

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {
    ...
    
    private UserManager userManager = new PropertiesUserManagerFactory().createUserManager();

    ...
}
</pre>

我们先来看看 `UserManager` 的源代码：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=ftplet-api/src/main/java/org/apache/ftpserver/ftplet/UserManager.java;h=16b35534722c73bf64273559f5340dae70c1e980;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public interface UserManager {
    User getUserByName(String username) throws FtpException;

    String[] getAllUserNames() throws FtpException;

    void delete(String username) throws FtpException;

    void save(User user) throws FtpException;

    boolean doesExist(String username) throws FtpException;

    User authenticate(Authentication authentication) throws AuthenticationFailedException;

    String getAdminName() throws FtpException;

    boolean isAdmin(String username) throws FtpException;
}
</pre>

从方法的名称我们基本就能看出，`UserManager` 相当于一个数据库，用来保存服务器所有的用户信息，
所有用户的信息均以 `User` 对象的形式注册到 `UserManager` 中。

我们再来看 `User` 类：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=ftplet-api/src/main/java/org/apache/ftpserver/ftplet/User.java;h=0f94fb9be664b42d850f4435a39d22706b7109a4;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public interface User {
    String getName();

    String getPassword();

    List&lt;Authority> getAuthorities();

    /**
     * Get authorities of the specified type granted to this user
     * @param clazz The type of {@link Authority}
     * @return Authorities of the specified class
     */
    List&lt;Authority> getAuthorities(Class&lt;? extends Authority> clazz);

    /**
     * Authorize a {@link AuthorizationRequest} for this user
     *
     * @param request
     *            The {@link AuthorizationRequest} to authorize
     * @return A populated AuthorizationRequest if the user was authorized, null
     *         otherwise.
     */
    AuthorizationRequest authorize(AuthorizationRequest request);

    int getMaxIdleTime();

    boolean getEnabled();

    String getHomeDirectory();
}
</pre>

可见，`User` 类包含了用户的登录信息、权限信息以及配置信息。

结合 Apache FtpServer 的官方文档，我们可知 FtpServer 默认提供了 `PropertiesUserManager` 和 `DbUserManager` 两个 `UserManager` 实现类，分别使用 properties 文件和 SQL 数据库来保存 `User` 信息。从 `DefaultFtpServerContext` 的默认初始化语句可知，默认使用的是 `PropertiesUserManager`。

于此，我们不再对 `UserManager` 进行深究。

## FileSystem

`FileSystemFactory` 同样是 `FtpServerContext` 的组件之一，它在 `DefaultFtpServerContext` 的默认设置是这样的：

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {
    ...

    private FileSystemFactory fileSystemManager = new NativeFileSystemFactory();

    ...
}
</pre>

先从 `FileSystemFactory` 看起：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=ftplet-api/src/main/java/org/apache/ftpserver/ftplet/FileSystemFactory.java;h=38e07abf22b953bc380088f52e244f3707d6a4d9;hb=refs/heads/1.0.6)）

<pre class="brush: java">
/**
 * Factory for file system implementations - it returns the file system view for user.
 */
public interface FileSystemFactory {

    /**
     * Create user specific file system view.
     * @param user The user for which the file system should be created
     * @return The current {@link FileSystemView} for the provided user
     * @throws FtpException 
     */
    FileSystemView createFileSystemView(User user) throws FtpException;

}
</pre>

可见，`FileSystemFactory` 会为每个 `User` 返回一个对应的 `FileSystemView`，这就使得不同的 `User` 看到的文件内容是可以不同的。

我们再来看一下 `FileSystemView`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=ftplet-api/src/main/java/org/apache/ftpserver/ftplet/FileSystemView.java;h=95d88e98f36b68e227282b55495a3ea21bfe99e8;hb=refs/heads/1.0.6)）

<pre class="brush: java">
/**
 * This is an abstraction over the user file system view.
 */
public interface FileSystemView {

    FtpFile getHomeDirectory() throws FtpException;
    
    FtpFile getWorkingDirectory() throws FtpException;

    boolean changeWorkingDirectory(String dir) throws FtpException;

    FtpFile getFile(String file) throws FtpException;

    boolean isRandomAccessible() throws FtpException;

    void dispose();
}
</pre>

`FileSystemView` 本身也能算是一个文件系统，能提供的信息包括了 Home 路径、当前路径以及可否随机访问，同时也可通过 `FileSystemView` 更改当前路径或获取指定名称的 `FtpFile`。

我们再来看一下 `FtpFile`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=ftplet-api/src/main/java/org/apache/ftpserver/ftplet/FtpFile.java;h=343f994dc8a619204f9abeceeae043f26825b116;hb=refs/heads/1.0.6)）

<pre class="brush: java">
/**
 * This is the file abstraction used by the server.
 */
public interface FtpFile {

    String getAbsolutePath();
    String getName();
    boolean isHidden();
    boolean isDirectory();
    boolean isFile();
    boolean doesExist();
    boolean isReadable();
    boolean isWritable();
    boolean isRemovable();
    String getOwnerName();
    String getGroupName();
    int getLinkCount();
    long getLastModified();
    boolean setLastModified(long time);
    long getSize();

    List&lt;FtpFile> listFiles();

    boolean mkdir();
    boolean delete();
    boolean move(FtpFile destination);

    /**
     * Create output stream for writing. 
     *
     * @param offset The number of bytes at where to start writing.
     *      If the file is not random accessible,
     *      any offset other than zero will throw an exception.
     */
    OutputStream createOutputStream(long offset) throws IOException;

    /**
     * Create input stream for reading. 
     *
     * @param offset The number of bytes at where to start writing.
     *      If the file is not random accessible,
     *      any offset other than zero will throw an exception.
     */
    InputStream createInputStream(long offset) throws IOException;
}
</pre>

可见，`FtpFile` 实际上并不对应于一个实实在在的 FTP 服务器上的文件，而是对应于 `FileSystemView` 中的一个给定的路径，正如 `java.io.File`。同时 `FtpFile` 也提供了访问路径的相关信息以及进行特定操作的方法。

接下来我们来看看 Apache FtpServer 给的 `FileSystemFactory`、`FileSystemView` 和 `FtpFile` 的默认实现。
实际上这些实现都对应于本地文件系统的实现，分别是 `NativeFileSystemFactory`、`NativeFileSystemView` 和 `NativeFtpFile`。

我们先来看看 `NativeFileSystemFactory`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/filesystem/nativefs/NativeFileSystemFactory.java;h=f15a19de375275c929944e84c8d1c06f4cf1f238;hb=refs/heads/1.0.6)）

<pre class="brush: java">
/**
 * Native file system factory. It uses the OS file system.
 */
public class NativeFileSystemFactory implements FileSystemFactory {
    private final Logger LOG = LoggerFactory.getLogger(NativeFileSystemFactory.class);

    /**
     * Should the home directories be created automatically
     */
    private boolean createHome;

    /**
     * Is this file system case insensitive. 
     * Enabling might cause problems when working against case-sensitive file systems, like on Linux
     */
    private boolean caseInsensitive;

    /**
     * Create the appropriate user file system view.
     */
    public FileSystemView createFileSystemView(User user) throws FtpException {
        synchronized (user) {
            // create home if does not exist
            if (createHome) {
                String homeDirStr = user.getHomeDirectory();
                File homeDir = new File(homeDirStr);
                if (homeDir.isFile()) {
                    LOG.warn("Not a directory :: " + homeDirStr);
                    throw new FtpException("Not a directory :: " + homeDirStr);
                }
                if ((!homeDir.exists()) && (!homeDir.mkdirs())) {
                    LOG.warn("Cannot create user home :: " + homeDirStr);
                    throw new FtpException("Cannot create user home :: "
                            + homeDirStr);
                }
            }

            FileSystemView fsView = new NativeFileSystemView(user, caseInsensitive);

            return fsView;
        }
    }

    public boolean isCreateHome() { ... }
    public void setCreateHome(boolean createHome) { ... }

    public boolean isCaseInsensitive() { ... }
    public void setCaseInsensitive(boolean caseInsensitive) { ... }

}
</pre>

一目了然，`NativeFilsSystemFactory` 包含 `createHome` 和 `caseInsensitive` 两个标识位，其中 `createHome` 用于决定在为用户创建 `NativeFilsSystemView` 时是否自动创建 Home 目录，而 `caseInsensitive` 位则被传入到了 `NativeFileSystemView` 中。除此之外，通过 `createFileSystemView` 方法调用 `User#getHomeDirectory()` 方法的方式我们也能看出，`User` 对象里保存的所谓 Home 路径实际上是给服务器看的，而用户连接 FTP 服务器后都应默认处于根目录 `/`。

我们再来看 `NativeFileSystemView`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/filesystem/nativefs/impl/NativeFileSystemView.java;h=55da62daf3f48af5c01529677539f1f1a7d8e4ab;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class NativeFileSystemView implements FileSystemView {
    private final Logger LOG = LoggerFactory.getLogger(NativeFileSystemView.class);

    private String rootDir;
    private String currDir;

    private User user;

    private boolean caseInsensitive = false;

    protected NativeFileSystemView(User user) throws FtpException {
        this(user, false);
    }

    public NativeFileSystemView(User user, boolean caseInsensitive) throws FtpException {
        if (user == null) 
            throw new IllegalArgumentException("user can not be null");
        
        if (user.getHomeDirectory() == null)
            throw new IllegalArgumentException("User home directory can not be null");

        this.caseInsensitive = caseInsensitive;

        // add last '/' if necessary
        String rootDir = user.getHomeDirectory();
        rootDir = NativeFtpFile.normalizeSeparateChar(rootDir);
        if (!rootDir.endsWith("/")) {
            rootDir += '/';
        }
        
        LOG.debug("Native filesystem view created for user \"{}\" with root \"{}\"", user.getName(), rootDir);
        
        this.rootDir = rootDir;
        this.user = user;

        currDir = "/";
    }

    ...

}
</pre>

可见，用户当前工作路径在 `NativeFileSystemView` 中被标识为了 `currDir` 成员，`rootDir` 实际上只用于与 `currDir` 变量相结合而判断用户实际在访问的是服务器上的哪个文件夹。

继续往下：

<pre class="brush: java">
public class NativeFileSystemView implements FileSystemView {
    ...

    public FtpFile getHomeDirectory() {
        return new NativeFtpFile("/", new File(rootDir), user);
    }

    public FtpFile getWorkingDirectory() {
        FtpFile fileObj = null;
        if (currDir.equals("/")) {
            fileObj = new NativeFtpFile("/", new File(rootDir), user);
        } else {
            File file = new File(rootDir, currDir.substring(1));
            fileObj = new NativeFtpFile(currDir, file, user);

        }
        return fileObj;
    }

    public FtpFile getFile(String file) {
        // get actual file object
        String physicalName = NativeFtpFile.getPhysicalName(rootDir, currDir, file, caseInsensitive);
        File fileObj = new File(physicalName);

        // strip the root directory and return
        String userFileName = physicalName.substring(rootDir.length() - 1);
        return new NativeFtpFile(userFileName, fileObj, user);
    }

    public boolean changeWorkingDirectory(String dir) {

        dir = NativeFtpFile.getPhysicalName(rootDir, currDir, dir, caseInsensitive);

        // not a directory - return false
        File dirObj = new File(dir);
        if (!dirObj.isDirectory()) {
            return false;
        }

        // strip user root and add last '/' if necessary
        dir = dir.substring(rootDir.length() - 1);
        if (dir.charAt(dir.length() - 1) != '/') {
            dir = dir + '/';
        }

        currDir = dir;
        return true;
    }

    public boolean isRandomAccessible() {
        return true;
    }

    public void dispose() {}

}
</pre>

`getHomeDirectory` 和 `getWorkingDirectory` 方法的实现证明了之前我们对 `rootDir` 和 `currDir` 关系的猜想。
在理解了这一点后，剩下的方法的实现就不难理解了。

至此，我们便理解了 Apache FtpServer 自带的 Native File System 的基本工作原理了。`NativeFtpFile` 的实现便不再赘述。

## CommandFactory

在阅读 `DefaultFtpServerContext` 的时候我们注意到，`CommandFactory` 组件的默认实例化方式是这样的：

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {
    ...

    private CommandFactory commandFactory = new CommandFactoryFactory().createCommandFactory();

    ...
}
</pre>

而在阅读 `DefaultFtpHandler` 的时候我们了解到，`CommandFactory` 的 `getCommand` 方法用于将用户请求里携带的命令字符串转换为 `Command` 对象，通过调用 `Command` 对象的 `execute` 方法即可执行该命令。

那么我们先来看一下 `CommandFactory`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/command/CommandFactory.java;h=ced5bdade688c31533f01d7ef2d0ba76342b7bbc;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public interface CommandFactory {

    /**
     * Get the command instance.
     * @param commandName The name of the command to create
     * @return The {@link Command} matching the provided name, or
     *   null if no such command exists.
     */
    Command getCommand(String commandName);

}
</pre>

基本是意料之中。我们再来看一下 `Command`（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/command/Command.java;h=24c1dc1ce0afa1faa7c3e61f0069a2f7ffa525da;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public interface Command {

    /**
     * Execute command.
     * 
     * @param session The current {@link FtpIoSession}
     * @param context The current {@link FtpServerContext}
     * @param request The current {@link FtpRequest}
     */
    void execute(FtpIoSession session, FtpServerContext context,
            FtpRequest request) throws IOException, FtpException;

}
</pre>

同样，并无太多出人意料的东西。再来看 `CommandFactoryFactory`（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/command/CommandFactoryFactory.java;h=ad3a2316fbfaf8a04e530c15b7d9d74fbb522b66;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class CommandFactoryFactory {

    private static final HashMap<String, Command> DEFAULT_COMMAND_MAP = new HashMap<String, Command>();

    static {
        // first populate the default command list
        DEFAULT_COMMAND_MAP.put("ABOR", new ABOR());
        DEFAULT_COMMAND_MAP.put("ACCT", new ACCT());

        ...
    }

    private Map&lt;String, Command> commandMap = new HashMap&lt;String, Command>();

    private boolean useDefaultCommands = true;

    /**
     * Create an {@link CommandFactory} based on the configuration on the factory.
     * @return The {@link CommandFactory}
     */
    public CommandFactory createCommandFactory() {
        
        Map&lt;String, Command> mergedCommands = new HashMap&lt;String, Command>();
        if (useDefaultCommands)
            mergedCommands.putAll(DEFAULT_COMMAND_MAP);
        
        mergedCommands.putAll(commandMap);
        
        return new DefaultCommandFactory(mergedCommands);
    }

    ...
}
</pre>

首先映入眼帘的是初始化为静态成员的 `DEFAULT_COMMAND_MAP`，包含了默认的从字符串到 `Command` 的映射。
除此之外我们还看到了实例成员 `commandMap` 和 `useDefaultCommands`。从 `createCommandFactory` 方法来看，`useDefaultCommands` 代表是否要向创建的 `DefaultCommandFactory` 中放入默认的 `DEFAULT_COMMAND_MAP`，而 `commandMap` 代表用户自行添加的命令映射。

`CommandFactoryFactory` 的剩余方法则基本验证了我们的猜想：

<pre class="brush: java">
public class CommandFactoryFactory {
    ...

    public boolean isUseDefaultCommands() { ... }
    public void setUseDefaultCommands(final boolean useDefaultCommands) { ... }

    public Map&lt;String, Command> getCommandMap() { ... }
    public void addCommand(String commandName, Command command) { ... }
    public void setCommandMap(final Map&lt;String, Command> commandMap) { ... }

}
</pre>

再来看 `DefaultCommandFactory`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/command/impl/DefaultCommandFactory.java;h=dea5a2e4f19b419d32f0b59e76f02edb91431473;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class DefaultCommandFactory implements CommandFactory {

    private Map&lt;String, Command> commandMap = new HashMap&lt;String, Command>();

    public DefaultCommandFactory(Map&lt;String, Command> commandMap) {
        this.commandMap = commandMap;
    }

    /**
     * Get command. Returns null if not found.
     */
    public Command getCommand(final String cmdName) {
        if (cmdName == null || cmdName.equals("")) {
            return null;
        }
        String upperCaseCmdName = cmdName.toUpperCase();
        return commandMap.get(upperCaseCmdName);
    }
}
</pre>

基本是意料之中：`DefaultCommandFactory` 使用一个内置的命令映射来解析传入的命令字符串。

这里我们以 `HELP` 指令为例，看看 FtpServer 是怎么实现 `Command` 接口的：（[完整源代码]()）

<pre class="brush: java">
public class HELP extends AbstractCommand {

    public void execute(final FtpIoSession session,
            final FtpServerContext context, final FtpRequest request)
            throws IOException {

        // reset state variables
        session.resetState();

        // print global help
        if (!request.hasArgument()) {
            session.write(LocalizedFtpReply.translate(session, request, context,
                    FtpReply.REPLY_214_HELP_MESSAGE, null, null));
            return;
        }

        // print command specific help if available
        String ftpCmd = request.getArgument().toUpperCase();
        MessageResource resource = context.getMessageResource();
        if (resource.getMessage(FtpReply.REPLY_214_HELP_MESSAGE, ftpCmd,
                session.getLanguage()) == null) {
            ftpCmd = null;
        }
        session.write(LocalizedFtpReply.translate(session, request, context,
                FtpReply.REPLY_214_HELP_MESSAGE, ftpCmd, null));
    }
}
</pre>

并没有什么特别的地方，但我们注意到，`HELP` 指令回应内容并不在这里直接产生，而是调用了 `LocalizedFtpReply` 的静态方法 `translate`，向其中传入了足够的上下文参数以及响应码，由 `LocalizedFtpReply` 来生成对应的回应信息。

剩余的 `Command` 实现类均处于 `org.apache.ftpserver.command.impl` 包中（[地址](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=tree;f=core/src/main/java/org/apache/ftpserver/command/impl;h=aa38131098b8efaba44eaeb0ecbafbb0c8a3b819;hb=refs/heads/1.0.6)），在此便不对它们进行一一解释。

## FtpStatistics

在 `FtpServerContext` 中包含一个 `FtpStatistics` 组件，而在 `DefaultFtpServerContext` 中，该组件是这样被初始化的：

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {
    ...

    private FtpStatistics statistics =  new DefaultFtpStatistics();

    ...
}
</pre>

从类的名称以及 `DefaultFtpHandler` 调用的方式来看，`FtpStatistics` 用于对 FTP 服务器进行一定的计数统计。
我们先来看一下 `FtpStatistics`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=ftplet-api/src/main/java/org/apache/ftpserver/ftplet/FtpStatistics.java;h=39a955710fd8e0988a703f12e2321d8dcb90d705;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public interface FtpStatistics {
    Date getStartTime();
    int getTotalUploadNumber();
    int getTotalDownloadNumber();
    int getTotalDeleteNumber();
    long getTotalUploadSize();
    long getTotalDownloadSize();
    int getTotalDirectoryCreated();
    int getTotalDirectoryRemoved();
    int getTotalConnectionNumber();
    int getCurrentConnectionNumber();
    int getTotalLoginNumber();
    int getTotalFailedLoginNumber();
    int getCurrentLoginNumber();
    int getTotalAnonymousLoginNumber();
    int getCurrentAnonymousLoginNumber();
    int getCurrentUserLoginNumber(User user);
    int getCurrentUserLoginNumber(User user, InetAddress ipAddress);
}
</pre>

这里我们大概了解到了一个 `FtpStatistics` 都统计了什么数据。接下来我们看一下扩展了 `FtpStatistics` 的 `ServerFtpStatistics` 接口：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/impl/ServerFtpStatistics.java;h=a174ed09d680d632feaee5c2f22ec70ebbee8372;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public interface ServerFtpStatistics extends FtpStatistics {

    void setObserver(StatisticsObserver observer);
    void setFileObserver(FileObserver observer);

    void setUpload(FtpIoSession session, FtpFile file, long size);
    void setDownload(FtpIoSession session, FtpFile file, long size);
    void setMkdir(FtpIoSession session, FtpFile dir);
    void setRmdir(FtpIoSession session, FtpFile dir);
    void setDelete(FtpIoSession session, FtpFile file);
    void setOpenConnection(FtpIoSession session);
    void setCloseConnection(FtpIoSession session);
    void setLogin(FtpIoSession session);
    void setLoginFail(FtpIoSession session);
    void setLogout(FtpIoSession session);

    void resetStatisticsCounters();
}
</pre>

这里我们可以看到，`ServerFtpStatistics` 提供的方法主要都是事件的记录方法，方法将在被调用的时候改变对应的统计值。

到这里，我们基本了解了一个 `FtpStatistics` 的运作原理了。`DefaultFtpStatistics` 是 `FtpStatistics` 的默认实现类，在此便不再赘述，感兴趣的读者可以点击[这里](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/impl/DefaultFtpStatistics.java;h=e8228e5a54d387a84e3830147f266b552d9fc00c;hb=refs/heads/1.0.6)查看它的源代码。

## MessageResource

在阅读 `HELP` 指令的源代码的时候我们了解到，响应的主要内容是通过 `LocalizedFtpReply` 的 `translate` 静态方法产生的。
那么我们先来看一下这个方法：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/impl/LocalizedFtpReply.java;h=ec7def47cfe21fa73f34fa88e64b22f809e21c09;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class LocalizedFtpReply extends DefaultFtpReply {
    ...

    public static LocalizedFtpReply translate(FtpIoSession session, FtpRequest request,
            FtpServerContext context, int code, String subId, String basicMsg) {
        String msg = translateMessage(session, request, context, code, subId,
                basicMsg);

        return new LocalizedFtpReply(code, msg);
    }

    private static String translateMessage(FtpIoSession session,
            FtpRequest request, FtpServerContext context, int code,
            String subId, String basicMsg) {
        MessageResource resource = context.getMessageResource();
        String lang = session.getLanguage();

        String msg = null;
        if (resource != null) {
            msg = resource.getMessage(code, subId, lang);
        }
        if (msg == null) {
            msg = "";
        }
        msg = replaceVariables(session, request, context, code, basicMsg, msg);

        return msg;
    }

    ...
}
</pre>

在 `translateMessage` 方法中，响应信息的内容实际上是通过 `MessageResource` 组件的 `getMessage` 方法获取到的。

那么我们就来看一下 `MessageResource` 这个组件：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/message/MessageResource.java;h=924fa1a8d575d9c59509130f821869e9b6e3f0ff;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public interface MessageResource {

    /**
     * Get all the available languages.
     * @return A list of available languages
     */
    List&lt;String> getAvailableLanguages();

    /**
     * Get the message for the corresponding code and sub id. If not found it
     * will return null.
     * @param code The reply code
     * @param subId The sub ID
     * @param language The language
     * @return The message matching the provided inputs, or null if not found
     */
    String getMessage(int code, String subId, String language);

    /**
     * Get all the messages.
     * @param language The language
     * @return All messages for the provided language
     */
    Map&lt;String, String> getMessages(String language);
}
</pre>

可以看到，外部类主要调用 `MessageResource` 的 `getMessage` 方法，通过传入响应码、语言以及 `subId` 来获取对应的响应内容。

我们回忆一下 `DefaultFtpServerContext` 默认初始化 `MessageResource` 的方式：

<pre class="brush: java">
public class DefaultFtpServerContext implements FtpServerContext {
    ...

    private MessageResource messageResource = new MessageResourceFactory().createMessageResource();

    ...
}
</pre>

那么我们来看一下 `MessageResourceFactory`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/message/MessageResourceFactory.java;h=a55c7d3bbb13303e30d6fb34da2a0f90699c8ec3;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class MessageResourceFactory {

    private List&lt;String> languages;
    private File customMessageDirectory;

    public MessageResource createMessageResource() {
        return new DefaultMessageResource(languages, customMessageDirectory);
    }

    public List&lt;String> getLanguages() { ... }
    public void setLanguages(List&lt;String> languages) { ... }

    public File getCustomMessageDirectory() { ... }
    public void setCustomMessageDirectory(File customMessageDirectory) { ... }
}
</pre>

由此可知，Apache FtpServer 使用 `DefaultMessageResource` 作为默认的 `MessageResource`，而 `DefaultMessageResource` 主要包含 `languages` 和 `customMessageDirectory` 两个域。

那么我们就来看一下 `DefaultMessageResource`：（[完整源代码](https://git-wip-us.apache.org/repos/asf?p=mina-ftpserver.git;a=blob;f=core/src/main/java/org/apache/ftpserver/message/impl/DefaultMessageResource.java;h=2b0fffa4a701d96aea51d62ba13f8ef85aa6b3ae;hb=refs/heads/1.0.6)）

<pre class="brush: java">
public class DefaultMessageResource implements MessageResource {
    private final Logger LOG = LoggerFactory.getLogger(DefaultMessageResource.class);

    private final static String RESOURCE_PATH = "org/apache/ftpserver/message/";

    private List&lt;String> languages;
    private Map&lt;String, PropertiesPair> messages;

    public DefaultMessageResource(List&lt;String> languages,
            File customMessageDirectory) {
        if (languages != null) {
            this.languages = Collections.unmodifiableList(languages);
        }

        // populate different properties
        messages = new HashMap&lt;String, PropertiesPair>();
        if (languages != null) {
            for (String language : languages) {
                PropertiesPair pair = createPropertiesPair(language, customMessageDirectory);
                messages.put(language, pair);
            }
        }

        PropertiesPair pair = createPropertiesPair(null, customMessageDirectory);
        messages.put(null, pair);
    }

    ...

    private static class PropertiesPair {
        public Properties defaultProperties = new Properties();
        public Properties customProperties = new Properties();
    }
}
</pre>

可以看到，除了之前已经了解到的 `languages` 域，`DefaultMessageResource` 还包含一个 `messages` 映射，值为包含 `defaultProperties` 和 `customProperties` 两个域的静态内部类 `PropertiesPair`，而 `DefaultMessageResource` 的构造函数利用了给定的 `languages` 和 `customMessageDirectory` 调用 `createPropertiesPair` 方法来初始化 `messages` 域。

我们继续往下看：

<pre class="brush: java">
public class DefaultMessageResource implements MessageResource {
    ...

    private PropertiesPair createPropertiesPair(String lang, File customMessageDirectory) {
        PropertiesPair pair = new PropertiesPair();

        // load default resource
        String defaultResourceName;
        if (lang == null) {
            defaultResourceName = RESOURCE_PATH + "FtpStatus.properties";
        } else {
            defaultResourceName = RESOURCE_PATH + "FtpStatus_" + lang  + ".properties";
        }
        InputStream in = null;
        try {
            in = getClass().getClassLoader().getResourceAsStream(defaultResourceName);
            if (in != null) {
                try {
                    pair.defaultProperties.load(in);
                } catch (IOException e) { ... }
            } else {
                throw new FtpServerConfigurationException(
                    "Failed to load messages from \"" + defaultResourceName
                    + "\", file not found in classpath");
            }
        } finally {
            IoUtils.close(in);
        }

        // load custom resource
        File resourceFile = null;
        if (lang == null) {
            resourceFile = new File(customMessageDirectory, "FtpStatus.gen");
        } else {
            resourceFile = new File(customMessageDirectory, "FtpStatus_" + lang + ".gen");
        }
        in = null;
        try {
            if (resourceFile.exists()) {
                in = new FileInputStream(resourceFile);
                pair.customProperties.load(in);
            }
        } catch (Exception ex) { ... }
        finally {
            IoUtils.close(in);
        }

        return pair;
    }

    ...
}
</pre>

可见，首先 `DefaultMessageResource` 会将声明在包 `org.apache.ftpserver.message` 中的 `properties` 文件的内容作为默认的响应内容读入，再根据给定的 `customMessgaeDirectory` 读入指定文件作为用户指定的响应内容。
通过阅读 Apache FtpServer 自带的这些 `properties` 文件便能很好地理解大致的作用原理，在此不再进行赘述。
